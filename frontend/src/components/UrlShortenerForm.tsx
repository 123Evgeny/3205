import React, { useState } from "react";
import axios, { isAxiosError } from "axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Link,
  Alert,
  AlertIcon,
  useClipboard,
} from "@chakra-ui/react";
import { API_URL } from "../config";

interface ShortenResponse {
  shortUrl: string;
}

interface UrlShortenerFormProps {
  onNewUrl: (shortUrl: string) => void;
}

export const UrlShortenerForm: React.FC<UrlShortenerFormProps> = ({
  onNewUrl,
}) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { onCopy, hasCopied } = useClipboard(shortenedUrl || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShortenedUrl(null);
    setIsLoading(true);

    try {
      const response = await axios.post<ShortenResponse>(`${API_URL}/shorten`, {
        originalUrl,
        alias: alias || undefined,
        expiresAt: expiresAt || undefined,
      });
      const fullUrl = `${API_URL}/${response.data.shortUrl}`;
      setShortenedUrl(fullUrl);
      onNewUrl(response.data.shortUrl);
    } catch (err) {
      let message = "Произошла ошибка.";
      if (isAxiosError(err) && err.response?.data?.message) {
        const errMessage = err.response.data.message;
        message = Array.isArray(errMessage) ? errMessage[0] : errMessage;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" w="100%">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Исходный URL</FormLabel>
            <Input
              type="url"
              placeholder="https://example.com"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Пользовательский алиас (необязательно)</FormLabel>
            <Input
              type="text"
              placeholder="мой-алиас"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              maxLength={20}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Дата окончания (необязательно)</FormLabel>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="teal"
            w="100%"
            isLoading={isLoading}
          >
            Сократить
          </Button>
        </VStack>
      </form>
      {shortenedUrl && (
        <Alert status="success" mt={4}>
          <AlertIcon />
          <Box flex="1">
            <Text>
              Короткая ссылка:{" "}
              <Link href={shortenedUrl} isExternal color="teal.500">
                {shortenedUrl}
              </Link>
            </Text>
          </Box>
          <Button onClick={onCopy}>
            {hasCopied ? "Скопировано" : "Скопировать"}
          </Button>
        </Alert>
      )}
      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
    </Box>
  );
};
