import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
export declare class UrlController {
    private readonly urlService;
    constructor(urlService: UrlService);
    create(createUrlDto: CreateUrlDto): Promise<import("./url.entity").Url>;
    redirect(res: any, shortUrl: string, ip: string): Promise<any>;
    getInfo(shortUrl: string): Promise<{
        originalUrl: string;
        createdAt: Date;
        clickCount: number;
    }>;
    remove(shortUrl: string): Promise<void>;
    getAnalytics(shortUrl: string): Promise<{
        clickCount: number;
        ipAddresses: string[];
    }>;
}
