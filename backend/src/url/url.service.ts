import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { Analytics } from './analytics.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
  ) {}

  async findAll() {
    return this.urlRepository.find();
  }

  async create(createUrlDto: CreateUrlDto): Promise<Url> {
    if (createUrlDto.alias) {
      const exists = await this.urlRepository.findOne({
        where: { alias: createUrlDto.alias },
      });
      if (exists) {
        throw new ConflictException('Alias already exists.');
      }
    }

    const shortUrl = createUrlDto.alias || nanoid(7);

    const newUrl = this.urlRepository.create({
      ...createUrlDto,
      shortUrl,
    });

    return this.urlRepository.save(newUrl);
  }

  async findOne(shortUrl: string, ipAddress: string): Promise<Url> {
    const url = await this.urlRepository.findOne({
      where: [{ shortUrl }, { alias: shortUrl }],
    });

    if (!url) {
      return null;
    }

    // Проверка на истечение срока действия
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      await this.urlRepository.delete(url.id);
      return null;
    }

    // Не ждем завершения, чтобы не замедлять редирект
    this.analyticsRepository.save({ url, ipAddress });
    this.urlRepository.increment({ id: url.id }, 'clickCount', 1);

    return url;
  }

  async getInfo(shortUrl: string): Promise<Url> {
    const url = await this.urlRepository.findOne({
      where: [{ shortUrl }, { alias: shortUrl }],
    });
    return url;
  }

  async remove(shortUrl: string): Promise<void> {
    const url = await this.getInfo(shortUrl);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    await this.urlRepository.delete(url.id);
  }

  async getAnalytics(shortUrl: string) {
    const url = await this.getInfo(shortUrl);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    const clicks = await this.analyticsRepository.find({
      where: { url: { id: url.id } },
      order: { visitDate: 'DESC' },
      take: 5,
    });

    const ipAddresses = clicks.map((c) => c.ipAddress);

    return {
      clickCount: url.clickCount,
      ipAddresses,
    };
  }
}
