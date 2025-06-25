import { UrlShortenerForm } from "./components/UrlShortenerForm";
import {
  Container,
  Heading,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import "./App.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { HistoryTable } from "./components/HistoryTable";
import axios from "axios";
import { API_URL } from "./config";

interface HistoryItem {
  id: number;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string;
  clickCount: number;
}

interface AnalyticsData {
  clicks: number;
  lastFiveIps: string[];
}

function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const toast = useToast();

  // Для модалки удаления
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<string | null>(null);
  const cancelRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      const formattedHistory = response.data.map((item: HistoryItem) => ({
        ...item,
        createdAt: new Date(item.createdAt).toLocaleString(),
        expiresAt: item.expiresAt
          ? new Date(item.expiresAt).toLocaleString()
          : "Никогда",
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error("Ошибка при загрузке истории:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить историю ссылок.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addUrlToHistory = () => {
    fetchHistory();
  };

  const handleDelete = (shortUrl: string) => {
    setUrlToDelete(shortUrl);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!urlToDelete) return;
    try {
      await axios.delete(`${API_URL}/delete/${urlToDelete}`);
      setHistory((prev) =>
        prev.filter((item) => item.shortUrl !== urlToDelete)
      );
      toast({
        title: "Ссылка удалена.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      toast({
        title: "Ошибка при удалении ссылки.",
        description: "Попробуйте еще раз.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleteOpen(false);
      setUrlToDelete(null);
    }
  };

  const handleShowAnalytics = async (shortUrl: string) => {
    setSelectedUrl(shortUrl);
    try {
      const response = await axios.get<AnalyticsData>(
        `${API_URL}/analytics/${shortUrl}`
      );
      setAnalytics(response.data);
      onOpen();
    } catch {
      toast({
        title: "Ошибка при получении статистики.",
        description: "Попробуйте еще раз.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.md" centerContent p={4}>
      <VStack spacing={8} w="100%">
        <Heading as="h1" size="xl">
          Сервис сокращения ссылок
        </Heading>
        <UrlShortenerForm onNewUrl={addUrlToHistory} />
        <HistoryTable
          history={history}
          onDelete={handleDelete}
          onShowAnalytics={handleShowAnalytics}
        />
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Статистика для «{selectedUrl}»</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              <strong>Всего переходов:</strong> {analytics?.clicks}
            </Text>
            <Text mt={4}>
              <strong>Последние 5 IP-адресов:</strong>
            </Text>
            {analytics?.lastFiveIps?.length ? (
              <ul>
                {analytics.lastFiveIps.map((ip, index) => (
                  <li key={index}>{ip}</li>
                ))}
              </ul>
            ) : (
              <Text>Переходов пока не было.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          setIsDeleteOpen(false);
          setUrlToDelete(null);
        }}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Подтвердите удаление
          </AlertDialogHeader>

          <AlertDialogBody>
            Вы уверены, что хотите удалить ссылку «{urlToDelete}»?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={() => {
                setIsDeleteOpen(false);
                setUrlToDelete(null);
              }}
            >
              Отмена
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
              Удалить
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
}

export default App;
