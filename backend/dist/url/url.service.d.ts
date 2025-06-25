import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { Analytics } from './analytics.entity';
import { CreateUrlDto } from './dto/create-url.dto';
export declare class UrlService {
    private readonly urlRepository;
    private readonly analyticsRepository;
    constructor(urlRepository: Repository<Url>, analyticsRepository: Repository<Analytics>);
    create(createUrlDto: CreateUrlDto): Promise<Url>;
    findOne(shortUrl: string, ipAddress: string): Promise<Url>;
    getInfo(shortUrl: string): Promise<Url>;
    remove(shortUrl: string): Promise<void>;
    getAnalytics(shortUrl: string): Promise<{
        clickCount: number;
        ipAddresses: string[];
    }>;
}
