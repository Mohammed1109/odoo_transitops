import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  PlayCircle,
  Edit3,
  Bell,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

export interface WideReusableColumn {
  key: string;
  header: string;
  width?: string;
  minWidth?: string;   // content-driven columns
  maxWidth?: string;   // optional clamp
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filters?: string[];
  onFilterChange?: (filters: string[]) => void;
}

export interface WideTableProps {
  tableId: string;
  columns: WideReusableColumn[];
  data: any[];
  className?: string;
  stickyHeader?: boolean;
  hoverEffect?: boolean;
  striped?: boolean;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  sortConfig?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string) => void;
  // Pagination props
  pagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  // Table height
  maxHeight?: string;
  // Selection
  selectionKey?: string;
  onDeleteSelected?: (selectedIds: (string | number)[]) => void;
  onEditSelected?: (selectedIds: (string | number)[]) => void;

  // bulk / start stop
  onBulkEditSelected?: (selectedIds: (string | number)[]) => void;
  onStartStopSelected?: (selectedIds: (string | number)[]) => void;

  // ⭐ NEW: Set Alert
  onSetAlertSelected?: (selectedIds: (string | number)[]) => void;

  showSelection?: boolean;
}

export default function WideReusableTable({
  columns,
  tableId,
  data,
  className = "",
  stickyHeader = true,
  striped = false,
  onRowClick,
  emptyMessage = "No data available",
  onSort,
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  maxHeight = "425px",
  selectionKey,
  onDeleteSelected,
  onEditSelected,
  onBulkEditSelected,
  onStartStopSelected,
  onSetAlertSelected,
  showSelection = true,
}: Readonly<WideTableProps>) {

  const location = useLocation();
  const STORAGE_KEY = `widereusable-table-filters:${tableId}:${location.pathname}${location.search}`;
  const [filtersHydrated, setFiltersHydrated] = useState(false);

  const [filterSearch, setFilterSearch] = useState("");

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({});
  const [draftFilters, setDraftFilters] = useState<{
    [key: string]: string[];
  }>({});
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set()
  );

  const [popupVisible, setPopupVisible] = useState(false);
  const [checkboxAnimation, setCheckboxAnimation] = useState<
    string | number | null
  >(null);
  const [buttonAnimation, setButtonAnimation] = useState<{
    type: "edit" | "delete" | "bulkEdit" | "startStop" | "alert" | null; // ⭐ add "alert"
    active: boolean;
  }>({ type: null, active: false });
  const [pageTransition, setPageTransition] = useState<
    "forward" | "backward" | "none"
  >("none");
  const [filterAnchor, setFilterAnchor] = useState<{
    key: string;
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const getRowId = (row: any, idx: number) =>
    row?.[selectionKey || "id"] ?? row?.id ?? idx;

  const BLANK_VALUE = "__BLANK__";

  const getFilteredData = () => {
    let filteredData = data;

    columns.forEach((column) => {
      if (!column.filterable) return;

      const applied = selectedFilters[column.key];

      if (applied?.length === 0) {
        filteredData = [];
        return;
      }

      // normal filtering
      if (applied && applied.length > 0) {
        filteredData = filteredData.filter((row) =>
          applied.includes(
            row[column.key] === null ||
              row[column.key] === undefined ||
              row[column.key] === ""
              ? BLANK_VALUE
              : String(row[column.key])
          )
        );
      }
    });

    return filteredData;
  };

  const filteredData = getFilteredData();

  const displayData = pagination
    ? filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : filteredData;

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      const direction = page > currentPage ? "forward" : "backward";
      setPageTransition(direction);
      onPageChange(page);
      setTimeout(() => setPageTransition("none"), 300);
    }
  };

  const getUniqueValues = (columnKey: string): string[] => {
    const values = data.map((row) => {
      const v = row[columnKey];
      return v === null || v === undefined || v === ""
        ? BLANK_VALUE
        : String(v);
    });

    return Array.from(new Set(values));
  };

  const renderFilterDropdown = (column: WideReusableColumn) => {
    if (!column.filterable || openFilter !== column.key) return null;

    const allValues = column.filters || getUniqueValues(column.key);
    const allSelectableValues = column.filters || getUniqueValues(column.key);

    const draft =
      draftFilters[column.key] ??
      selectedFilters[column.key] ??
      allSelectableValues;

    const isAllChecked =
      allSelectableValues.length > 0 &&
      allSelectableValues.every((v) => draft.includes(v));

    const filteredValues = allValues.filter((v) =>
      String(v).toLowerCase().includes(filterSearch.toLowerCase())
    );

    return (
      <div
        className="fixed z-[99999] bg-white rounded-lg border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
        style={{
          top: filterAnchor?.top,
          left: filterAnchor?.left,
          width: 260,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔍 Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35"
              />
              <circle cx="11" cy="11" r="7" />
            </svg>

            <input
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search by..."
              className="w-full pl-8 pr-2 py-1.5 text-[13px] border rounded-md 
              focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Select all + Clear */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b text-[13px]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllChecked}
              onChange={() =>
                setDraftFilters(prev => ({
                  ...prev,
                  [column.key]: isAllChecked
                    ? []        // UNCHECK = CLEAR
                    : allSelectableValues // CHECK = SELECT ALL
                }))
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Select All</span>

          </label>

          <button
            onClick={() =>
              setDraftFilters((prev) => ({
                ...prev,
                [column.key]: [],
              }))
            }
            className="text-red-500 hover:underline text-sm"
          >
            Clear

          </button>
        </div>

        {/* Options */}
        <div className="max-h-56 overflow-y-auto">
          {filteredValues.map((value) => (
            <label
              key={value}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px]
              hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={draft.includes(value)}
                onChange={() => {
                  setDraftFilters((prev) => {
                    const current = prev[column.key] || [];
                    return {
                      ...prev,
                      [column.key]: current.includes(value)
                        ? current.filter((v) => v !== value)
                        : [...current, value],
                    };
                  });
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">
                {value === BLANK_VALUE ? "" : value}
              </span>
            </label>
          ))}

          {filteredValues.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No Results
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-2 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={() => {
              setDraftFilters((prev) => ({
                ...prev,
                [column.key]:
                  selectedFilters[column.key] ?? allSelectableValues,
              }));

              setOpenFilter(null);
              setFilterAnchor(null);
            }}
            className="flex-1 py-1.5 text-[13px] border rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              setSelectedFilters((prev) => {
                const next = { ...prev };
                const currentDraft = draftFilters[column.key] || [];

                //  ONLY unblock clears when user explicitly applies new values
                if (currentDraft.length > 0) {
                  Object.keys(next).forEach((k) => {
                    if (k !== column.key && next[k]?.length === 0) {
                      delete next[k];
                    }
                  });
                }

                next[column.key] = currentDraft;
                return next;
              });

              setOpenFilter(null);
              setFilterAnchor(null);
            }}
            className="flex-1 py-1.5 text-[13px] bg-[#0b4a6f] text-white rounded-md hover:bg-[#083d5c]"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push("ellipsis-start");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const renderPageNumbers = () => {
    const pageNumbers = generatePageNumbers();

    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 
            transition-all duration-300 ease-out
            ${currentPage === 1
              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95 hover:text-blue-600"
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((page) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <span
                key={page} //  stable, semantic key
                className="flex items-center justify-center w-9 h-9 text-gray-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page as number)}
              className={`
                flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 
                transition-all duration-300 ease-out
                ${currentPage === page
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-[0_10px_40px_rgba(0,0,0,0.06)] shadow-blue-500/25 scale-105"
                  : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95 hover:text-blue-600"
                }
              `}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 
            transition-all duration-300 ease-out
            ${currentPage === totalPages
              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95 hover:text-blue-600"
            }
          `}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const isColumnActuallyFiltered = (column: WideReusableColumn) => {
    const selected = selectedFilters[column.key];
    if (!selected) return false;

    const allValues = column.filters || getUniqueValues(column.key);

    // default state (all selected) → NOT filtered
    if (selected.length === allValues.length) return false;

    // partial OR clear (0) → filtered
    return true;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  useEffect(() => {
    const close = () => {
      setOpenFilter(null);
      setFilterAnchor(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    const close = () => {
      setOpenFilter(null);
      setFilterAnchor(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!openFilter) setFilterSearch("");
  }, [openFilter]);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedFilters(parsed);
      setDraftFilters(parsed);
    }
    setFiltersHydrated(true);
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!filtersHydrated) return;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFilters));
  }, [selectedFilters, STORAGE_KEY, filtersHydrated]);


  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);

      setCheckboxAnimation(id);
      setTimeout(() => setCheckboxAnimation(null), 600);

      setPopupVisible(copy.size > 0);
      return copy;
    });
  };

  const isAllVisibleSelected = () => {
    const visibleIds = displayData.map((row, idx) => getRowId(row, idx));
    return (
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = displayData.map((row, idx) => getRowId(row, idx));
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (visibleIds.every((id) => copy.has(id))) {
        visibleIds.forEach((id) => copy.delete(id));
      } else {
        visibleIds.forEach((id) => copy.add(id));
      }
      setPopupVisible(copy.size > 0);
      return copy;
    });
  };

  const handleDeleteSelected = () => {
    const ids = Array.from(selectedIds);
    if (onDeleteSelected) onDeleteSelected(ids);
    setSelectedIds(new Set());
    setPopupVisible(false);
  };

  const handleEditSelected = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 1) {
      const id = ids[0];
      if (onEditSelected) onEditSelected([id]);
    }
  };

  const handleBulkEdit = () => {
    const ids = Array.from(selectedIds);
    if (ids.length > 1) {
      if (onBulkEditSelected) onBulkEditSelected(ids);
    }
  };

  const handleStartStop = () => {
    const ids = Array.from(selectedIds);
    if (ids.length > 0) {
      if (onStartStopSelected) onStartStopSelected(ids);
    }
  };

  //  NEW: Set Alert
  const handleSetAlert = () => {
    const ids = Array.from(selectedIds);
    if (ids.length > 0 && onSetAlertSelected) {
      onSetAlertSelected(ids);
    }
  };

  const handleAnimatedDelete = () => {
    setButtonAnimation({ type: "delete", active: true });
    setTimeout(() => {
      handleDeleteSelected();
      setButtonAnimation({ type: null, active: false });
    }, 400);
  };

  const handleAnimatedEdit = () => {
    setButtonAnimation({ type: "edit", active: true });
    setTimeout(() => {
      handleEditSelected();
      setButtonAnimation({ type: null, active: false });
    }, 400);
  };

  const handleAnimatedBulkEdit = () => {
    setButtonAnimation({ type: "bulkEdit", active: true });
    setTimeout(() => {
      handleBulkEdit();
      setButtonAnimation({ type: null, active: false });
    }, 400);
  };

  const handleAnimatedStartStop = () => {
    setButtonAnimation({ type: "startStop", active: true });
    setTimeout(() => {
      handleStartStop();
      setButtonAnimation({ type: null, active: false });
    }, 400);
  };

  //  NEW: animated Set Alert
  const handleAnimatedSetAlert = () => {
    setButtonAnimation({ type: "alert", active: true });
    setTimeout(() => {
      handleSetAlert();
      setButtonAnimation({ type: null, active: false });
    }, 400);
  };

  const AnimatedCheckbox = ({
    checked,
    onChange,
    id,
    className = "",
  }: {
    checked: boolean;
    onChange: () => void;
    id?: string | number;
    className?: string;
  }) => (
    <label
      className={`relative inline-flex items-center cursor-pointer  ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        className="sr-only"
      />
      <div
        className={`
          relative w-4 h-4 flex items-center justify-center border-2 rounded-full 
          transition-all duration-300 ease-out
          ${checked
            ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 scale-105 shadow-[0_10px_40px_rgba(0,0,0,0.06)] shadow-blue-500/25"
            : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-md"
          }
          ${checkboxAnimation === id ? "animate-pulse-scale" : ""}
        `}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white transition-all duration-300 ease-out"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </label>
  );

  const portalRoot = document.getElementById("dropdown-portal");
  if (!portalRoot) return null;

  const buttonAnimationColor = (() => {
    switch (buttonAnimation.type) {
      case "delete":
        return "bg-red-500";
      case "edit":
        return "bg-blue-500";
      case "bulkEdit":
        return "bg-purple-500";
      case "startStop":
        return "bg-emerald-500";
      case "alert":
        return "bg-amber-500";
      default:
        return "bg-green-500";
    }
  })();

  return (
    <div className={`relative flex flex-col ${className}`}>
      {showSelection && (
        <div
          className={`
            fixed top-[100px] inset-x-0 flex justify-center z-50 transition-all duration-500 ease-out
            ${popupVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            }
          `}
        >
          <div
            className={`
              flex items-center bg-white text-black rounded-xl
              overflow-hidden shadow-2xl border border-gray-200
              divide-x divide-gray-200 backdrop-blur-sm bg-white/95
              transition-all duration-500 ease-out
              ${popupVisible ? "scale-100" : "scale-95"}
            `}
          >
            <div className="px-6 py-3 text-sm font-medium bg-white flex items-center gap-2">
              <div
                className={`
                  w-2 h-2 rounded-full animate-pulse
                  ${buttonAnimationColor}
                `}
              ></div>
              {selectedIds.size} selected
            </div>

            {onEditSelected && selectedIds.size === 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnimatedEdit();
                }}
                className={`
                  px-6 py-3 transition-all duration-300 ease-out 
                  flex items-center justify-center group relative
                  ${buttonAnimation.type === "edit" && buttonAnimation.active
                    ? "bg-blue-50 scale-95"
                    : "hover:bg-gray-50"
                  }
                `}
                title="Edit"

                disabled={buttonAnimation.active}
              >
                <div
                  className={`
                    absolute inset-0 bg-blue-500 rounded-lg transition-all duration-300 ease-out
                    ${buttonAnimation.type === "edit" && buttonAnimation.active
                      ? "scale-100 opacity-10"
                      : "scale-0 opacity-0"
                    }
                  `}
                ></div>
                <Pencil
                  className={`
                    w-4 h-4 transition-all duration-300 ease-out
                    ${buttonAnimation.type === "edit" && buttonAnimation.active
                      ? "text-blue-600 scale-110"
                      : "text-gray-600 group-hover:text-blue-600 group-hover:scale-110"
                    }
                  `}
                />
              </button>
            )}

            {onBulkEditSelected && selectedIds.size > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnimatedBulkEdit();
                }}
                className={`
                  px-6 py-3 transition-all duration-300 ease-out 
                  flex items-center justify-center group relative
                  ${buttonAnimation.type === "bulkEdit" &&
                    buttonAnimation.active
                    ? "bg-purple-50 scale-95"
                    : "hover:bg-gray-50"
                  }
                `}
                title="Bulk Edit"

                disabled={buttonAnimation.active}
              >
                <div
                  className={`
                    absolute inset-0 bg-purple-500 rounded-lg transition-all duration-300 ease-out
                    ${buttonAnimation.type === "bulkEdit" &&
                      buttonAnimation.active
                      ? "scale-100 opacity-10"
                      : "scale-0 opacity-0"
                    }
                  `}
                ></div>
                <Edit3
                  className={`
                    w-4 h-4 transition-all duration-300 ease-out
                    ${buttonAnimation.type === "bulkEdit" &&
                      buttonAnimation.active
                      ? "text-purple-600 scale-110"
                      : "text-gray-600 group-hover:text-purple-600 group-hover:scale-110"
                    }
                  `}
                />
              </button>
            )}

            {onStartStopSelected && selectedIds.size > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnimatedStartStop();
                }}
                className={`
                  px-6 py-3 transition-all duration-300 ease-out 
                  flex items-center justify-center group relative
                  ${buttonAnimation.type === "startStop" &&
                    buttonAnimation.active
                    ? "bg-emerald-50 scale-95"
                    : "hover:bg-gray-50"
                  }
                `}
                title="Start Stop"

                disabled={buttonAnimation.active}
              >
                <div
                  className={`
                    absolute inset-0 bg-emerald-500 rounded-lg transition-all duration-300 ease-out
                    ${buttonAnimation.type === "startStop" &&
                      buttonAnimation.active
                      ? "scale-100 opacity-10"
                      : "scale-0 opacity-0"
                    }
                  `}
                ></div>
                <PlayCircle
                  className={`
                    w-4 h-4 transition-all duration-300 ease-out
                    ${buttonAnimation.type === "startStop" &&
                      buttonAnimation.active
                      ? "text-emerald-600 scale-110"
                      : "text-gray-600 group-hover:text-emerald-600 group-hover:scale-110"
                    }
                  `}
                />
              </button>
            )}

            {/* ⭐ NEW: Set Alert button (1+ selected) */}
            {onSetAlertSelected && selectedIds.size > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnimatedSetAlert();
                }}
                className={`
                  px-6 py-3 transition-all duration-300 ease-out 
                  flex items-center justify-center group relative
                  ${buttonAnimation.type === "alert" && buttonAnimation.active
                    ? "bg-amber-50 scale-95"
                    : "hover:bg-gray-50"
                  }
                `}
                title="Set Alert"

                disabled={buttonAnimation.active}
              >
                <div
                  className={`
                    absolute inset-0 bg-amber-500 rounded-lg transition-all duration-300 ease-out
                    ${buttonAnimation.type === "alert" && buttonAnimation.active
                      ? "scale-100 opacity-10"
                      : "scale-0 opacity-0"
                    }
                  `}
                ></div>
                <Bell
                  className={`
                    w-4 h-4 transition-all duration-300 ease-out
                    ${buttonAnimation.type === "alert" && buttonAnimation.active
                      ? "text-amber-600 scale-110"
                      : "text-gray-600 group-hover:text-amber-600 group-hover:scale-110"
                    }
                  `}
                />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAnimatedDelete();
              }}
              className={`
                px-6 py-3 transition-all duration-300 ease-out 
                flex items-center justify-center group relative
                ${buttonAnimation.type === "delete" && buttonAnimation.active
                  ? "bg-red-50 scale-95"
                  : "hover:bg-gray-50"
                }
              `}
              title="Delete"

              disabled={buttonAnimation.active}
            >
              <div
                className={`
                  absolute inset-0 bg-red-500 rounded-lg transition-all duration-300 ease-out
                  ${buttonAnimation.type === "delete" && buttonAnimation.active
                    ? "scale-100 opacity-10"
                    : "scale-0 opacity-0"
                  }
                `}
              ></div>
              <Trash2
                className={`
                  w-4 h-4 transition-all duration-300 ease-out
                  ${buttonAnimation.type === "delete" && buttonAnimation.active
                    ? "text-red-600 scale-110"
                    : "text-gray-600 group-hover:text-red-600 group-hover:scale-110"
                  }
                `}
              />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
          <div
            className="custom-scrollbar overflow-x-auto overflow-y-visible w-full relative"
            style={{ maxHeight }}
          >
            <table
              className="w-full text-sm"
              style={{ tableLayout: "auto" }}
            >
              <thead className="bg-gray-100 text-gray-700 sticky z-40 top-0 ">
                <tr>
                  {showSelection && (
                    <th className="px-2 py-3 w-[40px] sticky left-0 z-50 bg-gray-100">
                      <div className="flex items-center justify-center">
                        <AnimatedCheckbox
                          checked={isAllVisibleSelected()}
                          onChange={toggleSelectAllVisible}
                          className="hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </th>
                  )}

                  {columns.map((column, colIndex) => (
                    <th
                      key={column.key}
                      className={`
                        relative px-4 py-3 
                        ${colIndex === 0
                          ? `sticky ${showSelection ? "left-[40px]" : "left-0"} z-50 bg-gray-100`
                          : ""
                        }
                        ${stickyHeader ? "top-0" : ""}
                        ${column.sortable || column.filterable
                          ? "cursor-pointer hover:bg-gray-200"
                          : ""
                        }
                      `}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                      onClick={() => handleSort(column.key, column.sortable)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap">
                          {column.header}
                        </span>

                        {column.filterable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              const rect = e.currentTarget.getBoundingClientRect();
                              const DROPDOWN_WIDTH = 260;
                              const DROPDOWN_HEIGHT = 320;

                              let left = rect.right - DROPDOWN_WIDTH;
                              let top = rect.bottom + 6;

                              if (left + DROPDOWN_WIDTH > window.innerWidth) {
                                left = window.innerWidth - DROPDOWN_WIDTH - 8;
                              }
                              if (left < 8) left = 8;
                              if (top + DROPDOWN_HEIGHT > window.innerHeight) {
                                top = rect.top - DROPDOWN_HEIGHT - 6;
                              }

                              setOpenFilter(column.key);
                              setFilterAnchor({
                                key: column.key,
                                top,
                                left,
                                width: DROPDOWN_WIDTH,
                              });

                              setDraftFilters((prev) => ({
                                ...prev,
                                [column.key]:
                                  selectedFilters[column.key] ??
                                  (column.filters || getUniqueValues(column.key)),
                              }));
                            }}
                            className={`shrink-0 p-1 rounded transition
                                ${isColumnActuallyFiltered(column)
                                ? "text-blue-600"
                                : "text-gray-400 hover:text-gray-600"
                              }
                          `}
                            title="Filter"
                          >
                            <i className="fas fa-filter text-xs" />
                          </button>
                        )}

                        {openFilter === column.key &&
                          createPortal(
                            renderFilterDropdown(column),
                            portalRoot
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {displayData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (showSelection ? 1 : 0)}
                      className="px-4 py-8 text-center text-gray-500 transition-all duration-300"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  displayData.map((row, index) => {
                    const rowId = getRowId(row, index);
                    const isSelected = selectedIds.has(rowId);
                    let selectionCellBgClass = "bg-white";

                    if (isSelected) {
                      selectionCellBgClass = "bg-blue-50/80";
                    } else if (striped && index % 2 === 0) {
                      selectionCellBgClass = "bg-gray-50";
                    }
                    return (
                      <tr
                        key={rowId}
                        className={`
                          border-b transition-all duration-500 ease-out
                          ${pageTransition === "forward"
                            ? "animate-slide-in-right"
                            : ""
                          }
                          ${pageTransition === "backward"
                            ? "animate-slide-in-left"
                            : ""
                          }
                          ${!isSelected && striped && index % 2 === 0
                            ? "bg-gray-50"
                            : ""
                          }
                          ${isSelected
                            ? "bg-gradient-to-r from-blue-50/80 to-blue-100/50"
                            : ""
                          }
                          ${onRowClick
                            ? "cursor-pointer hover:bg-gray-100/50"
                            : ""
                          }
                        `}
                        onClick={() => onRowClick?.(row)}
                      >
                        {showSelection && (
                          <td
                            className={`
                              px-4 py-3 sticky left-0 z-20
                              ${selectionCellBgClass}
                            `}
                          >
                            <div className="flex items-center justify-center">
                              <AnimatedCheckbox
                                checked={isSelected}
                                onChange={() => toggleSelect(rowId)}
                                id={rowId}
                              />
                            </div>
                          </td>
                        )}

                        {columns.map((column, colIndex) => {
                          // --- text color / weight ---
                          const selectedTextClass = isSelected
                            ? "text-blue-900/80 font-medium"
                            : "";

                          // --- sticky + background for first column ---
                          let stickyBgClass = "";

                          if (colIndex === 0) {
                            let bgClass = "bg-white";

                            if (isSelected) {
                              bgClass = "bg-blue-50/80";
                            } else if (striped && index % 2 === 0) {
                              bgClass = "bg-gray-50";
                            }

                            stickyBgClass = `
    sticky ${showSelection ? "left-[40px]" : "left-0"} z-20
    ${bgClass}
  `;
                          }

                          return (
                            <td
                              key={column.key}
                              style={{
                                width: column.width,
                                minWidth: column.minWidth,
                                maxWidth: column.maxWidth,
                              }}
                              className={`
        px-4 py-3 text-${column.align || "left"}
        transition-all duration-300
        ${selectedTextClass}
        ${stickyBgClass}
      `}
                            >
                              {column.render
                                ? column.render(row[column.key], row)
                                : row[column.key]}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pagination && (
        <div className="mt-3 rounded-lg border-t p-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-3 border border-gray-200 shadow-md">
          {" "}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">
              Show
            </span>

            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="font-medium">
              entries
            </span>

          </div>
          <div className="text-sm text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-lg transition-colors duration-300">
            Showing{" "}

            <span className="text-blue-600 font-semibold">{startItem}</span>
            to{" "}

            <span className="text-blue-600 font-semibold">{endItem}</span>
            of{" "}

            <span className="text-blue-600 font-semibold">{totalItems}</span>{" "}
            entries

          </div>
          <div className="flex items-center">{renderPageNumbers()}</div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse-scale {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-8px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          .animate-pulse-scale {
            animation: pulse-scale 0.6s ease-out;
          }
          
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          
          .animate-slide-in-right {
            animation: slide-in-right 0.4s ease-out;
          }
          
          .animate-slide-in-left {
            animation: slide-in-left 0.4s ease-out;
          }
        `}
      </style>
    </div>
  );
}
