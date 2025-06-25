import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // Очищаем таблицы перед каждым тестом для изоляции
    await dataSource.query(
      'TRUNCATE TABLE "analytics" RESTART IDENTITY CASCADE;',
    );
    await dataSource.query('TRUNCATE TABLE "urls" RESTART IDENTITY CASCADE;');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Сокращение ссылок', () => {
    it('/shorten (POST) - должен создать короткую ссылку', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://google.com' })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('shortUrl');
        });
    });

    it('/shorten (POST) - должен создать ссылку с кастомным алиасом', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://yandex.ru', alias: 'yandex' })
        .expect(201)
        .then((res) => {
          expect(res.body.shortUrl).toEqual('yandex');
        });
    });

    it('/shorten (POST) - должен вернуть 409 при дубликате алиаса', async () => {
      await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://yandex.ru', alias: 'yandex' });

      return request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://yahoo.com', alias: 'yandex' })
        .expect(409);
    });
  });

  describe('Получение и редирект', () => {
    it('/ (GET) - должен вернуть все ссылки', async () => {
      await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://google.com' });
      await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://yandex.ru' });

      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .then((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(2);
        });
    });

    it('/{shortUrl} (GET) - должен редиректить на оригинальный URL', async () => {
      const res = await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://google.com' });
      const shortUrl = res.body.shortUrl;

      return request(app.getHttpServer())
        .get(`/${shortUrl}`)
        .expect(302)
        .expect('Location', 'https://google.com');
    });

    it('/info/{shortUrl} (GET) - должен вернуть информацию о ссылке', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://google.com' });
      const shortUrl = createRes.body.shortUrl;

      return request(app.getHttpServer())
        .get(`/info/${shortUrl}`)
        .expect(200)
        .then((res) => {
          expect(res.body.originalUrl).toEqual('https://google.com');
        });
    });
  });

  describe('Удаление и аналитика', () => {
    it('/delete/{shortUrl} (DELETE) - должен удалить ссылку', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://google.com' });
      const shortUrl = createRes.body.shortUrl;

      await request(app.getHttpServer())
        .delete(`/delete/${shortUrl}`)
        .expect(204);

      return request(app.getHttpServer()).get(`/info/${shortUrl}`).expect(404);
    });

    it('/analytics/{shortUrl} (GET) - должен вернуть статистику', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/shorten')
        .send({ originalUrl: 'https://google.com' });
      const shortUrl = createRes.body.shortUrl;

      // Симулируем клик
      await request(app.getHttpServer()).get(`/${shortUrl}`);

      return request(app.getHttpServer())
        .get(`/analytics/${shortUrl}`)
        .expect(200)
        .then((res) => {
          expect(res.body.clickCount).toBe(1);
          expect(res.body.lastFiveIps).toBeInstanceOf(Array);
          expect(res.body.lastFiveIps.length).toBe(1);
        });
    });
  });
});
