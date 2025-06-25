import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  Text,
  TableContainer,
} from "@chakra-ui/react";
import { DeleteIcon, InfoIcon } from "@chakra-ui/icons";

interface HistoryItem {
  id: number;
  originalUrl: string;
  shortUrl: string;
  alias?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  clickCount: number;
}

interface HistoryTableProps {
  history: HistoryItem[];
  onDelete: (shortUrl: string) => void;
  onShowAnalytics: (shortUrl: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  onDelete,
  onShowAnalytics,
}) => {
  if (history.length === 0) {
    return <Text>История пуста. Создайте короткую ссылку!</Text>;
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" w="100%">
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Короткая ссылка</Th>
              <Th>Оригинальный URL</Th>
              <Th>Дата создания</Th>
              <Th>Истекает</Th>
              <Th>Переходы</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((item) => (
              <Tr key={item.id}>
                <Td>{item.shortUrl}</Td>
                <Td>{item.originalUrl}</Td>
                <Td>{item.createdAt}</Td>
                <Td>{item.expiresAt || "Никогда"}</Td>
                <Td>{item.clickCount}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Показать статистику"
                      icon={<InfoIcon />}
                      onClick={() => onShowAnalytics(item.shortUrl)}
                    />
                    <IconButton
                      aria-label="Удалить ссылку"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={() => onDelete(item.shortUrl)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
