import { useState, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
} from '@heroui/react';

export default function DataTable({
  columns,
  data,
  keyField = 'id',
  selectionMode = 'multiple',
  selectedKeys,
  onSelectionChange,
  isLoading = false,
  emptyContent,
  sortDescriptor,
  onSortChange,
  bottomContent,
  removeWrapper = false,
  className = '',
}) {
  const [hoveredRow, setHoveredRow] = useState(null);

  const renderCell = useCallback((item, columnKey) => {
    const column = columns.find(c => c.key === columnKey);
    if (!column) return null;

    if (column.renderCell) {
      return column.renderCell(item);
    }

    return item[columnKey];
  }, [columns]);

  return (
    <Table
      aria-label="Data table"
      selectionMode={selectionMode}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      className={className}
      bottomContent={bottomContent}
      removeWrapper={removeWrapper}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            allowsSorting={column.sortable}
            className={column.className}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={data}
        emptyContent={emptyContent || 'No data found'}
        isLoading={isLoading}
        loadingContent={<Spinner />}
      >
        {(item) => (
          <TableRow
            key={item[keyField]}
            className="data-table-row cursor-pointer"
            onMouseEnter={() => setHoveredRow(item[keyField])}
            onMouseLeave={() => setHoveredRow(null)}
          >
            {(columnKey) => (
              <TableCell>
                {renderCell(item, columnKey)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}