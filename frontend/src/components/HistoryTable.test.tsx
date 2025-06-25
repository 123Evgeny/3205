import { render, screen } from "@testing-library/react";
import { HistoryTable } from "./HistoryTable";

describe("HistoryTable", () => {
  it("должен отображать сообщение, когда история пуста", () => {
    render(
      <HistoryTable
        history={[]}
        onDelete={() => {}}
        onShowAnalytics={() => {}}
      />
    );
    expect(
      screen.getByText("История пуста. Создайте короткую ссылку!")
    ).toBeInTheDocument();
  });

  it("должен отображать строки таблицы, когда история не пуста", () => {
    const historyData = [
      {
        id: 1,
        originalUrl: "https://google.com",
        shortUrl: "g",
        clickCount: 10,
        createdAt: "2024-01-01",
        expiresAt: "Никогда",
      },
      {
        id: 2,
        originalUrl: "https://yandex.ru",
        shortUrl: "y",
        clickCount: 5,
        createdAt: "2024-01-02",
        expiresAt: "Никогда",
      },
    ];
    render(
      <HistoryTable
        history={historyData}
        onDelete={() => {}}
        onShowAnalytics={() => {}}
      />
    );

    // Проверяем наличие заголовков
    expect(screen.getByText("Оригинальный URL")).toBeInTheDocument();
    expect(screen.getByText("Короткая ссылка")).toBeInTheDocument();

    // Проверяем, что данные отображаются
    expect(screen.getByText("https://google.com")).toBeInTheDocument();
    expect(screen.getByText("https://yandex.ru")).toBeInTheDocument();

    // Проверяем, что кнопок "Удалить" нужное количество
    const deleteButtons = screen.getAllByLabelText("Удалить ссылку");
    expect(deleteButtons).toHaveLength(2);
  });
});
