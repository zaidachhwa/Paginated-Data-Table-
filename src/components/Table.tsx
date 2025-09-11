import React, { useCallback, useEffect, useRef, useState } from "react";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";

interface Data {
  title: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string;
  date_start?: number;
  date_end?: number;
}

interface PaginationParams {
  total: number;
}

export const Table: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [selectedData, setSelectedData] = useState<Data[]>([]);
  const [selectValue, setSelectValue] = useState<number>(0);
  const [pageNum, setPageNum] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationParams | null>(null);
  const panel = useRef<OverlayPanel | null>(null);

  const fetchData = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      if (res.data) {
        setData(res.data?.data);
        setPagination(res.data?.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility Function
  const fetchPage = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );

      if (res.data) {
        return res.data?.data;
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);
  useEffect(() => {
    fetchData(1);
  }, []);

  // Handler Functions
  const handleSelectRows = async (e: React.MouseEvent<HTMLButtonElement>) => {
    panel.current?.toggle(e);
    let rowsNeeded = selectValue;
    let selectedRows: Data[] = [];

    let currentPage = 1;

    while (rowsNeeded > 0) {
      const pageData = await fetchPage(currentPage);

      const minimum = Math.min(rowsNeeded, pageData.length);

      selectedRows = [...selectedRows, ...pageData.slice(0, minimum)];

      rowsNeeded -= minimum;
      currentPage++;
    }

    setSelectedData(selectedRows);
    setLoading(false);
  };

  const handleClearSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
    panel.current?.toggle(e);
    setSelectValue(0);
    setSelectedData([]);
  };

  return (
    <div className="card" style={{ width: "90%", margin: "100px auto" }}>
      <DataTable
        paginator
        rows={12}
        value={data}
        totalRecords={pagination?.total}
        loading={loading}
        first={pageNum}
        lazy
        onPage={(e: DataTablePageEvent) => {
          setPageNum(e?.first);
          fetchData((e.page ?? 0) + 1);
        }}
        stripedRows
        selectionMode={"multiple"}
        selection={selectedData}
        onSelectionChange={(e) => {
          setSelectedData(e.value);
        }}
        dataKey="id"
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>

        <Column
          header={
            <i
              className="pi pi-chevron-down"
              onClick={(e) => panel.current?.toggle(e)}
              style={{ fontSize: "1rem", cursor: "pointer" }}
            ></i>
          }
          headerTooltip="Select"
          headerTooltipOptions={{
            position: "top",
            style: { fontSize: ".8rem" },
          }}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist Display"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Date Start"></Column>
        <Column field="date_end" header="Date End"></Column>
      </DataTable>
      <OverlayPanel ref={panel}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="number"
            value={selectValue}
            onChange={(e) => setSelectValue(Number(e.target.value))}
            placeholder="Select Rows"
            style={{
              outline: "0px",
              padding: "10px",
              border: "1px solid gray",
              borderRadius: "5px",
            }}
          />

          <Button
            type="submit"
            label="Submit"
            size="small"
            onClick={handleSelectRows}
          />
          <Button
            link
            onClick={handleClearSelection}
            size="small"
            style={{ fontSize: ".7rem" }}
            label="Clear Selection"
          />
        </div>
      </OverlayPanel>
    </div>
  );
};
