/* eslint-disable prettier/prettier */
/* eslint-disable simple-import-sort/imports */
import { useAtom } from "jotai";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import type { IServer } from "../../../utils/http-spec/IServer";
import { chosenServerAtom } from "../chosenServer";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { nanoid } from "nanoid";
import { MenuItemContent } from "../MenuItemConten";
import { createCustomService } from "../../events";
import DeleteIcon from "@mui/icons-material/Delete";

export type ServersDropdownProps = {
  servers: IServer[];
  customServers: IServer[];
  onDeleteServer?: (url: string) => void;
};



export const ServersDropdown = ({
  servers,
  customServers,
  onDeleteServer,
}: ServersDropdownProps) => {
  const [chosenServer, setChosenServer] = useAtom(chosenServerAtom);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const serverItems = useMemo(() => {
    return servers.map((server) => ({
      ...server,
      name: server.url,
      description: server.description || "",
    }));
  }, [servers]);


  const onChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const url = event.target.value as string;
      const server = servers.find((server) => server.url === url);
      if (server) setChosenServer(server);
      setOpen(false)
    },
    [servers, setChosenServer]
  );

  const defaultValue = serverItems[0]?.url ?? "";

  const handleDelete = (url: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteTarget(url);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteServer?.(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteTarget(null);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const isCustomUrl = (url: string) => customServers.some((s) => s.url === url);


  return (
    <Box>
      <FormControl size="small" fullWidth>
        <Select
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          onChange={onChange}
          value={chosenServer?.url ?? ""}
          defaultValue={defaultValue}
          renderValue={(value) => value || "Server"}
          className="MuiInputBase-root MuiSelect-select custom"
        >
          {serverItems.map((server) => {
            const { url, name } = server;
            const isSelected = url === chosenServer?.url;
            const isCustom = isCustomUrl(url);
            return (
              <MenuItem
                // key={nanoid(8)}
                key={url}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                value={url}
                
                selected={isSelected}
              >
                <div
                  style={{
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Tooltip
                      title={url}
                      placement="top-start"
                      arrow
                      enterDelay={300}
                    >
                      <Box>
                        <MenuItemContent
                          title={url}
                          subtitle={server.description || "-"}
                          maxWidth="400px"
                        />
                      </Box>
                  </Tooltip>
                </div>
                {isCustom && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      // e.stopPropagation();
                      handleDelete(url, e);
                      
                    }}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </MenuItem>
            );
          })}

          <Button
            disableRipple
            startIcon={<AddIcon />}
            className="MuiButtonBase-root custom iconButton"
            style={{ marginTop: "8px", color: "#0068FF", paddingLeft: "16px" }}
            onClick={() => {
              setOpen(false);
              document.dispatchEvent(createCustomService);
            }}
          >
            Add Custom Server
          </Button>
        </Select>
      </FormControl>

      <Dialog open={!!deleteTarget} onClose={handleDeleteDialogClose}>
        <DialogTitle>
          Delete <strong>{deleteTarget}</strong> server?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

ServersDropdown.displayName = "ServersDropdown";

