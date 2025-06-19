/* eslint-disable @typescript-eslint/no-unused-expressions */
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
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { nanoid } from "nanoid";
import { createCustomService } from "../../events";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { ButtonWithHint } from "src/components/ButtonWithHint";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);

  const serverItems = useMemo(() => {
    const uniqueServersMap = new Map<string, IServer>(); // Use a Map for de-duplication

    // Add API servers first.
    servers.forEach(server => {
      uniqueServersMap.set(server.url, {
        ...server,
        name: server.url,
        description: server.description || "-",
      });
    });

    // Add custom servers, overriding if URL already exists.
    customServers.forEach(server => {
      uniqueServersMap.set(server.url, {
        ...server,
        name: server.url,
        description: server.description || "-",
      });
    });

    // Convert map values back to an array
    return Array.from(uniqueServersMap.values());
  }, [servers, customServers]);


  const onChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const url = event.target.value as string;
      const server = serverItems.find((server) => server.url === url);
      if (server) setChosenServer(server);
      setOpen(false)
    },
    [serverItems, setChosenServer]
  );


  const handleDelete = (url: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteTarget(url);
  };

  const handleDeleteServer = useCallback(
    (serverToDelete: { url: string }) => {
      // onDeleteServer prop is now the single point for triggering deletion in parent
      onDeleteServer?.(serverToDelete.url);
    },
    [onDeleteServer]
  );
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      handleDeleteServer({ url: deleteTarget })
      setDeleteTarget(null);
      setShowSuccess(true);
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



  return (
    <Box>
      <FormControl size="small" fullWidth>
        <Select
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          onChange={onChange}
          value={chosenServer?.url ?? ""}
          displayEmpty
          renderValue={(value) => {
            if (!value) {
              return <Typography sx={{ color: '#888' }}>Server</Typography>
            }
            // Display the full URL here
            return (
              <Typography component="span" sx={{ fontWeight: 600, color: "#000" }}>
                {value}
              </Typography>
            );
          }
          }
          className="MuiInputBase-root MuiSelect-select custom"
          MenuProps={{
            PaperProps: {
              sx: { minWidth: 340, maxWidth: 400 },
            },
          }}
        >
          {serverItems.map((server) => {
            const { url, description, custom } = server;
            const isSelected = url === chosenServer?.url;
            return (
              <MenuItem
                key={nanoid(8)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  px: 2,
                  py: 1,
                  gap: 0.5,
                  position: "relative",
                  "&:hover .delete-icon": { opacity: 1 },
                }}
                value={url}
                selected={isSelected}
                onMouseEnter={() => setHoveredUrl(url)}
                onMouseLeave={() => setHoveredUrl(null)}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Tooltip title={url} placement="top-start" arrow enterDelay={300}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {url} {/* Display the full URL here */}
                    </Typography>
                  </Tooltip>

                  {custom && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        handleDelete(url, e);
                      }}
                      sx={{
                        ml: 1,
                        opacity: hoveredUrl === url ? 1 : 0,
                        transition: "opacity 0.2s",
                        color: "#1976d2",
                        "&:hover": { color: "#d32f2f", background: "#f5f5f5" },
                      }}
                    >
                      <DeleteOutlinedIcon sx={{ color: '#1976d2', cursor: 'pointer' }} />
                    </IconButton>
                  )}

                </Box>
                <Typography variant="caption" color="text.secondary" noWrap
                  sx={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    ml: 0.2,
                    mt: 0.3,
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {description || "-"}
                </Typography>
              </MenuItem>
            );
          })}

          <ButtonWithHint
            disableRipple
            sx={{
              mt: 1,
              color: "#1976d2",
              fontWeight: 500,
              cursor: "pointer",
            }}
            className="MuiButtonBase-root custom iconButton"
            style={{ marginTop: "8px", color: "#0068FF", paddingLeft: "16px" }}
            onClick={() => {
              setOpen(false);
              document.dispatchEvent(createCustomService);
            }}
            startIcon={<AddIcon />}
          >
            Add Custom Server
          </ButtonWithHint>
        </Select>

      </FormControl>

      <Dialog open={!!deleteTarget} onClose={handleDeleteDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 340,
            p: 2,
            boxShadow: 3,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <DialogTitle sx={{ p: 0, fontWeight: 400, fontSize: 18, flex: 1 }}>
            Delete <strong>{deleteTarget}</strong> server?
          </DialogTitle>
          <IconButton
            onClick={handleDeleteDialogClose}
            sx={{
              ml: 1,
              color: "grey.500",
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogActions sx={{ justifyContent: "flex-start", pt: 2 }}>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              boxShadow: "none",
              textTransform: "none",
              px: 3,
              mr: 1,
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            Remove
          </Button>
          <Button onClick={handleDeleteDialogClose} variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              bgcolor: "#fff",
              borderColor: "#E0E0E0",
              color: "#333",
              fontWeight: 500,
              fontSize: 15,
              "&:hover": {
                bgcolor: "#fafafa",
                borderColor: "#d3d3d3",
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert onClose={() => setShowSuccess(false)} severity="success" elevation={6} variant="filled">
          Server has been deleted successfully
        </MuiAlert>
      </Snackbar>
    </Box >
  );
};

ServersDropdown.displayName = "ServersDropdown";