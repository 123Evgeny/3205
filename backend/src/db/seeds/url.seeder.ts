import { Injectable } from '@nestjs/common';
import { UrlService } from '../../url/url.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from '../../url/url.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UrlSeederService {
  constructor(
    private readonly urlService: UrlService,
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async seed() {
    const googleUrl = await this.urlRepository.findOne({
      where: { alias: 'google' },
    });
    if (!googleUrl) {
      console.log('Seeding google.com...');
      await this.urlService.create({
        originalUrl: 'https://google.com',
        alias: 'google',
      });
    }

    const yandexUrl = await this.urlRepository.findOne({
      where: { originalUrl: 'https://yandex.ru' },
    });
    if (!yandexUrl) {
      console.log('Seeding yandex.ru...');
      await this.urlService.create({
        originalUrl: 'https://yandex.ru',
      });
    }

    console.log('Seeding completed!');
  }
}
