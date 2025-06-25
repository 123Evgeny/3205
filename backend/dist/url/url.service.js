"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const url_entity_1 = require("./url.entity");
const analytics_entity_1 = require("./analytics.entity");
const nanoid_1 = require("nanoid");
let UrlService = class UrlService {
    constructor(urlRepository, analyticsRepository) {
        this.urlRepository = urlRepository;
        this.analyticsRepository = analyticsRepository;
    }
    async create(createUrlDto) {
        if (createUrlDto.alias) {
            const exists = await this.urlRepository.findOne({
                where: { alias: createUrlDto.alias },
            });
            if (exists) {
                throw new common_1.ConflictException('Alias already exists.');
            }
        }
        const shortUrl = createUrlDto.alias || (0, nanoid_1.nanoid)(7);
        const newUrl = this.urlRepository.create({
            ...createUrlDto,
            shortUrl,
        });
        return this.urlRepository.save(newUrl);
    }
    async findOne(shortUrl, ipAddress) {
        const url = await this.urlRepository.findOne({
            where: [{ shortUrl }, { alias: shortUrl }],
        });
        if (!url) {
            return null;
        }
        if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
            await this.urlRepository.delete(url.id);
            return null;
        }
        this.analyticsRepository.save({ url, ipAddress });
        this.urlRepository.increment({ id: url.id }, 'clickCount', 1);
        return url;
    }
    async getInfo(shortUrl) {
        const url = await this.urlRepository.findOne({
            where: [{ shortUrl }, { alias: shortUrl }],
        });
        return url;
    }
    async remove(shortUrl) {
        const url = await this.getInfo(shortUrl);
        if (!url) {
            throw new common_1.NotFoundException('URL not found');
        }
        await this.urlRepository.delete(url.id);
    }
    async getAnalytics(shortUrl) {
        const url = await this.getInfo(shortUrl);
        if (!url) {
            throw new common_1.NotFoundException('URL not found');
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
};
exports.UrlService = UrlService;
exports.UrlService = UrlService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(url_entity_1.Url)),
    __param(1, (0, typeorm_1.InjectRepository)(analytics_entity_1.Analytics)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UrlService);
//# sourceMappingURL=url.service.js.map