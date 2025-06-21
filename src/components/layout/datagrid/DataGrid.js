import React from "react";
import DataTable from "react-data-table-component";
import { Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

//icons
import { IoMdAdd } from "react-icons/io";
import { MdFilterList, MdHeight } from "react-icons/md";
import { minHeight } from "@mui/system";

const filterDataByColumns = (data, searchQuery, searchableColumns) => {
    if (!searchQuery) return data; // Return all data if no search query

    return data.filter((item) =>
        searchableColumns.some((selector) => {
            const columnValue = typeof selector === "function" ? selector(item) : item[selector];
            return String(columnValue || "").toLowerCase().includes(searchQuery.toLowerCase());
        })
    );
};

const DataGrid = ({
    data,
    columns,
    title,
    searchQuery,
    setSearchQuery,
    searchableColumns,
    buttonLabel = "Add New",
    buttonRoute = "/"
}) => {
    const navigate = useNavigate();
    const filteredData = filterDataByColumns(data, searchQuery, searchableColumns);

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: "#EAE4E4",
                color: "#757575",
                fontSize: "12px",
                textAlign: "center",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "8px",
                paddingRight: "8px",
                minHeight: "20px"   
            }
        },
        cells: {
            style: {
                fontSize: "12px",
                transition: "background-color 0.3s ease",
                "&:hover": {
                    backgroundColor: "#f0f0f0",
                    cursor: "pointer",
                },
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "8px",
                paddingRight: "8px",
                minHeight: "20px"
            }
        }
    };

    return (
        <div className="commonDataTable height100">
            <div className="commonDataTableHead">
                <div className='float-start'>
                    <h6 className="commonTableTitle">{title}</h6>
                </div>

                {/* Search Input & Button Wrapper */}
                <div className="d-flex justify-content-end align-items-center" style={{ gap: "6px" }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        className="searchInput"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {/* Button Next to Search */}
                    <Button className="secondaryBtn"
                        variant="Secondary"
                    >
                        <span><MdFilterList /></span><span>Filter</span>
                    </Button>
                    <Button className="primaryBtn"
                        onClick={() => navigate(buttonRoute)}
                        variant="primary"
                    >
                        <span><IoMdAdd /></span><span>{buttonLabel}</span>
                    </Button>
                </div>
            </div>

            <div className="commonDataTableBody" style={{ overflow: "auto" }}>
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    responsive
                    customStyles={customStyles}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 180px)"
                />
            </div>
        </div>
    );
};

export default DataGrid;
