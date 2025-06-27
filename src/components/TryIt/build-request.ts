import {
  Dictionary,
  IHttpOperation,
  IMediaTypeContent,
} from "@stoplight/types";
import { Request as HarRequest } from "har-format";

import {
  getServerUrlWithDefaultValues,
  IServer,
} from "../../utils/http-spec/IServer";
import { IAgent } from '../../state/agent'
import {
  filterOutAuthorizationParams,
  HttpSecuritySchemeWithValues,
  isApiKeySecurityScheme,
  isBasicSecurityScheme,
  isBearerSecurityScheme,
  isDigestSecurityScheme,
  isOAuth2SecurityScheme,
} from "./Auth/authentication-utils";
import {
  BodyParameterValues,
  createRequestBody,
} from "./Body/request-body-utils";
import { CookieStore } from "./cookie-store";
import { MockData } from "./Mocking/mocking-utils";

const PROXY_ENDPOINT = "/playground/proxy";

type NameAndValue = {
  name: string;
  value: string;
};

const nameAndValueObjectToPair = ({
  name,
  value,
}: NameAndValue): [string, string] => [name, value];

interface BuildRequestInput {
  httpOperation: IHttpOperation;
  mediaTypeContent: IMediaTypeContent | undefined;
  parameterValues: Dictionary<string, string>;
  bodyInput?: BodyParameterValues | string;
  mockData?: MockData;
  origin: string;
  auth?: HttpSecuritySchemeWithValues;
  chosenServer?: IServer | null;
  credentials?: "omit" | "include" | "same-origin";
  corsProxy?: string;
  proxyAgent?: IAgent; // Added proxyAgent to the input interface
}

const getServerUrl = ({
  chosenServer,
  httpOperation,
  mockData,
  corsProxy,
  origin,
}: Pick<
  BuildRequestInput,
  "httpOperation" | "chosenServer" | "mockData" | "corsProxy" | "origin"
>) => {
  const server = chosenServer || httpOperation.servers?.[0];
  const chosenServerUrl = server && getServerUrlWithDefaultValues(server);
  const serverUrl = mockData?.url || chosenServerUrl || origin;

  if (corsProxy && !mockData) {
    return `${corsProxy}${serverUrl}`;
  }

  return serverUrl;
};

export async function buildFetchRequest({
  httpOperation,
  mediaTypeContent,
  bodyInput,
  parameterValues,
  mockData,
  origin,
  auth,
  chosenServer,
  credentials = "include",
  corsProxy,
  proxyAgent, 
}: BuildRequestInput): Promise<Parameters<typeof fetch>> {
  const serverUrl = getServerUrl({
    httpOperation,
    mockData,
    chosenServer,
    corsProxy,
    origin,
  });

  const shouldIncludeBody = ["PUT", "POST", "PATCH"].includes(
    httpOperation.method.toUpperCase()
  );

  const queryParams =
    httpOperation.request?.query
      ?.map((param) => ({
        name: param.name,
        value: parameterValues[param.name] ?? "",
      }))
      .filter(({ value }) => value.length > 0) ?? [];

  const rawHeaders = filterOutAuthorizationParams(
    httpOperation.request?.headers ?? [],
    httpOperation.security
  )
    .map((header) => ({
      name: header.name,
      value: parameterValues[header.name] ?? "",
    }))
    .filter(({ value }) => value.length > 0);

  const [queryParamsWithAuth, headersWithAuth] = runAuthRequestEnhancements(
    auth,
    queryParams,
    rawHeaders
  );

  const expandedPath = uriExpand(httpOperation.path, parameterValues);

  const shouldUseProxyEndpoint = chosenServer?.shouldUseProxyEndpoint

  // urlObject is concatenated this way to avoid /user and /user/ endpoint edge cases
  const urlObject = new URL(serverUrl + expandedPath)
  urlObject.search = new URLSearchParams(queryParamsWithAuth.map(nameAndValueObjectToPair)).toString()

  const body =
    typeof bodyInput === "object"
      ? await createRequestBody(mediaTypeContent, bodyInput)
      : bodyInput;


  const alwaysUseProxy = !!proxyAgent;


  const alwaysUseProxy = !!proxyAgent;

  const headers = {
    // do not include multipart/form-data - browser handles its content type and boundary
    ...(mediaTypeContent?.mediaType !== "multipart/form-data"
      ? { "Content-Type": mediaTypeContent?.mediaType ?? "application/json" }
      : {}),
    ...Object.fromEntries(headersWithAuth.map(nameAndValueObjectToPair)),
    ...mockData?.header,
    ...(shouldUseProxyEndpoint
      ? {
        'X-Apihub-Authorization': token,
        'X-Apihub-Proxy-Url': urlObject.href,
      }
      : {}),
  }

  return [
    alwaysUseProxy ? `${origin}${PROXY_ENDPOINT}` : urlObject.href, // Final URL for the fetch call
    {
      credentials,
      method: httpOperation.method.toUpperCase(),
      headers,
      body: shouldIncludeBody ? body : undefined,
    },
  ];
}

const runAuthRequestEnhancements = (
  auth: HttpSecuritySchemeWithValues | undefined,
  queryParams: NameAndValue[],
  headers: NameAndValue[]
): [NameAndValue[], NameAndValue[]] => {
  if (!auth) return [queryParams, headers];

  const newQueryParams = [...queryParams];
  const newHeaders = [...headers];

  if (isApiKeySecurityScheme(auth.scheme)) {
    if (auth.scheme.in === "query") {
      newQueryParams.push({
        name: auth.scheme.name,
        value: auth.authValue ?? "",
      });
    }

    if (auth.scheme.in === "header") {
      newHeaders.push({
        name: auth.scheme.name,
        value: auth.authValue ?? "",
      });
    }

    if (auth.scheme.in === "cookie") {
      CookieStore.set(auth.scheme.name, auth.authValue ?? "", {
        path: "/",
        maxAge: 60_000,
      });
    }
  }

  if (isOAuth2SecurityScheme(auth.scheme)) {
    newHeaders.push({
      name: "Authorization",
      value: auth.authValue ?? "",
    });
  }

  if (isBearerSecurityScheme(auth.scheme)) {
    newHeaders.push({
      name: "Authorization",
      value: `Bearer ${auth.authValue}`,
    });
  }

  if (isDigestSecurityScheme(auth.scheme)) {
    newHeaders.push({
      name: "Authorization",
      value: auth.authValue?.replace(/\s\s+/g, " ").trim() ?? "",
    });
  }

  if (isBasicSecurityScheme(auth.scheme)) {
    newHeaders.push({
      name: "Authorization",
      value: `Basic ${auth.authValue}`,
    });
  }

  return [newQueryParams, newHeaders];
};

export async function buildHarRequest({
  httpOperation,
  bodyInput,
  parameterValues,
  mediaTypeContent,
  auth,
  mockData,
  chosenServer,
  corsProxy,
  origin,
}: Omit<BuildRequestInput, 'token'>): Promise<HarRequest> {
  const serverUrl = getServerUrl({ httpOperation, mockData, chosenServer, corsProxy, origin })

  const mimeType = mediaTypeContent?.mediaType ?? "application/json";
  const shouldIncludeBody = ["PUT", "POST", "PATCH"].includes(
    httpOperation.method.toUpperCase()
  );

  const queryParams =
    httpOperation.request?.query
      ?.map((param) => ({
        name: param.name,
        value: parameterValues[param.name] ?? "",
      }))
      .filter(({ value }) => value.length > 0) ?? [];

  const headerParams =
    httpOperation.request?.headers?.map((header) => ({
      name: header.name,
      value: parameterValues[header.name] ?? "",
    })) ?? [];

  if (mockData?.header) {
    headerParams.push({ name: "Prefer", value: mockData.header.Prefer });
  }

  const [queryParamsWithAuth, headerParamsWithAuth] =
    runAuthRequestEnhancements(auth, queryParams, headerParams);
  const expandedPath = uriExpand(httpOperation.path, parameterValues);
  const urlObject = new URL(serverUrl + expandedPath);

  let postData: HarRequest["postData"] = undefined;
  if (shouldIncludeBody && typeof bodyInput === "string") {
    postData = { mimeType, text: bodyInput };
  }
  if (shouldIncludeBody && typeof bodyInput === "object") {
    postData = {
      mimeType,
      params: Object.entries(bodyInput).map(([name, value]) => {
        if (value instanceof File) {
          return {
            name,
            fileName: value.name,
            contentType: value.type,
          };
        }
        return {
          name,
          value,
        };
      }),
    };
  }

  return {
    method: httpOperation.method.toUpperCase(),
    url: urlObject.href,
    httpVersion: "HTTP/1.1",
    cookies: [],
    headers: [
      { name: "Content-Type", value: mimeType },
      ...headerParamsWithAuth,
    ],
    queryString: queryParamsWithAuth,
    postData: postData,
    headersSize: -1,
    bodySize: -1,
  };
}

function uriExpand(uri: string, data: Dictionary<string, string>) {
  if (!data) {
    return uri;
  }
  return uri.replace(/{([^#?]+?)}/g, (match, value) => {
    return data[value] || value;
  });
}