# Qubership APIHUB REST Playground

REST Playground is a REST API testing tool that allows you to send requests to the server using real data. 
It automatically extracts request parameters from the API specification, simplifying the testing process for users.

## Features

- **Automatic Request configuration:** Request parameters are automatically determined based on the API specification, which saves the user from having to manually configure.
- **Support for custom URLs:** If the server URL is not specified in the specification, the user can manually enter their own URL.
- **Limitations:** Playground is intended exclusively for REST operations; request parameters cannot be added or deleted manually.

## Components
- **TryIt:** Allows users to send REST requests to the server using data from the API specification. All query parameters are automatically extracted from the specification, which simplifies the testing process.
- **Examples:** Provides examples of requests and responses based on the API specification, which helps users better understand the API structure and usage.

## Modifications
Fork of the [@stoplightio/elements](https://github.com/stoplightio/elements).

TryIt and Examples are extracted as separate web-components