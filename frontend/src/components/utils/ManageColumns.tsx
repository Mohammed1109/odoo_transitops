import React, { useState, useEffect } from "react";
import { Lock, LockOpen, X, RotateCcw } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import type { Column } from "./ReusableTable";



export interface ColumnWithState extends Column {
  key: string;
  header: string;
  visible: boolean;
  locked?: boolean;
  filters?: string[];
  backendField?: string;
  onFilterChange?: (filters: string[]) => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  columns: ColumnWithState[];
  onSave: (updated: ColumnWithState[]) => void;
}

const ManageColumns: React.FC<Props> = ({ open, onClose, columns, onSave }) => {

  const [localCols, setLocalCols] = useState<ColumnWithState[]>(columns);

  const [originalCols, setOriginalCols] = useState<ColumnWithState[]>([]);

  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchSelected, setSearchSelected] = useState("");

  // Store original default columns ONLY once
  useEffect(() => {
    if (originalCols.length === 0 && columns.length > 0) {
      setOriginalCols(columns.map(c => ({ ...c }))); // true default
    }

    if (open) {
      setLocalCols(columns.map(c => ({ ...c }))); // working copy
    }
  }, [open, columns]);


  // -------------------------------------------
  // DRAG LOGIC (locked items cannot drag)
  // -------------------------------------------
  const handleDrag = (result: DropResult) => {
    if (!result.destination) return;

    const items = [...localCols];
    const visibleItems = items.filter(c => c.visible);

    const draggedColumn = visibleItems[result.source.index];

    if (draggedColumn.locked) return; // 🚫 cannot drag locked columns

    const [removed] = visibleItems.splice(result.source.index, 1);
    visibleItems.splice(result.destination.index, 0, removed);

    // Rebuild full array
    const reordered = [];
    let vi = 0;

    for (let col of items) {
      if (col.visible) reordered.push(visibleItems[vi++]);
      else reordered.push(col);
    }

    setLocalCols(reordered);
  };

  // -------------------------------------------
  // RESET → restore pure backend original state
  // -------------------------------------------
  const resetToDefault = () => {
    setLocalCols(originalCols.map(c => ({ ...c }))); // clone original state
  };

  // -------------------------------------------
  // VISIBILITY TOGGLE (prevent hiding locked)
  // -------------------------------------------
  const toggleVisibility = (key: string) => {
    setLocalCols(prev =>
      prev.map(col => {
        if (col.key !== key) {
          return col;
        }

        if (col.locked) {
          return col;
        }

        return { ...col, visible: !col.visible };
      })
    );
  };

  // -------------------------------------------
  // LOCK TOGGLE
  // -------------------------------------------
  const toggleLock = (key: string) => {
    setLocalCols(prev =>
      prev.map(col =>
        col.key === key ? { ...col, locked: !col.locked } : col
      )
    );
  };

  const handleToggleLock = (key: string) => {
    toggleLock(key);
  };
  const renderLockIcon = (locked: boolean) =>
    locked ? (
      <Lock size={16} className="text-blue-600" />
    ) : (
      <LockOpen size={16} className="text-gray-500" />
    );

  const handleToggleVisibility = (key: string) => {
    toggleVisibility(key);
  };

  // -------------------------------------------
  // AVAILABLE / SELECTED LISTS
  // -------------------------------------------
  const availableColumns = localCols.filter(
    c => !c.visible && c.header.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const selectedColumns = localCols.filter(
    c => c.visible && c.header.toLowerCase().includes(searchSelected.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">

      <div className="bg-white rounded-lg shadow-xl w-2/3 max-w-6xl h-[85vh] flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Manage Columns</h2>
            <p className="text-sm text-gray-500">
              Choose the table columns you need and arrange them by priority.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 grid grid-cols-2 divide-x overflow-hidden">

          {/* LEFT SIDE */}
          <div className="p-6 space-y-4 overflow-y-auto">
            <p className="font-medium">Column Options</p>

            <input
              placeholder="Search columns"
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />

            <div className="space-y-3 mt-2">
              {availableColumns.map((col) => (
                <label key={col.key} className="flex items-center gap-3 text-sm">

                  <input
                    type="checkbox"
                    disabled={col.locked}
                    checked={col.visible}
                    onChange={() => !col.locked && toggleVisibility(col.key)}
                    className="disabled:opacity-40 disabled:cursor-not-allowed"
                  />

                  {col.header}
                </label>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-6 flex flex-col gap-3 overflow-hidden">

            <div className="flex justify-between items-center">
              <p className="font-medium">Selected Columns</p>

              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to default
              </button>
            </div>

            <input
              placeholder="Search selected"
              value={searchSelected}
              onChange={(e) => setSearchSelected(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <DragDropContext onDragEnd={handleDrag}>
                <Droppable droppableId="selected-list">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 mt-2">

                      {selectedColumns.map((col, index) => (
                        <Draggable
                          key={col.key}
                          draggableId={col.key}
                          index={index}
                          isDragDisabled={col.locked}
                        >
                          {(provided) => {
                            const draggableProps = col.locked ? {} : provided.draggableProps;
                            const dragHandleProps = col.locked ? {} : provided.dragHandleProps;

                            return (
                              <div
                                ref={provided.innerRef}
                                {...draggableProps}
                                className={`p-3 bg-gray-50 border rounded-lg flex justify-between items-center 
            ${col.locked ? "opacity-60 cursor-not-allowed" : ""}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    {...dragHandleProps}
                                    className={`text-gray-400 
                ${col.locked
                                        ? "cursor-not-allowed opacity-40"
                                        : "cursor-grab"}`}
                                  >
                                    ⋮⋮
                                  </div>

                                  <span className="text-sm">{col.header}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <button onClick={() => handleToggleLock(col.key)}>
                                    {renderLockIcon(col.locked ?? false)}
                                  </button>

                                  <button
                                    disabled={col.locked}
                                    onClick={() => handleToggleVisibility(col.key)}
                                    className="text-gray-400 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    ✕
                                  </button>

                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}


                      {provided.placeholder}

                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(localCols)}
            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageColumns;
