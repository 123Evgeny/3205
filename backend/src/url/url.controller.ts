import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Res,
  Ip,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Get()
  findAll() {
    return this.urlService.findAll();
  }

  @Post('shorten')
  create(@Body() createUrlDto: CreateUrlDto) {
    // В идеале, нужно возвращать полный URL с хостом, например http://localhost:3000/
    return this.urlService.create(createUrlDto);
  }

  @Get(':shortUrl')
  async redirect(
    @Res() res,
    @Param('shortUrl') shortUrl: string,
    @Ip() ip: string,
  ) {
    const url = await this.urlService.findOne(shortUrl, ip);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return res.redirect(302, url.originalUrl);
  }

  @Get('info/:shortUrl')
  async getInfo(@Param('shortUrl') shortUrl: string) {
    const url = await this.urlService.getInfo(shortUrl);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    const { originalUrl, createdAt, clickCount } = url;
    return { originalUrl, createdAt, clickCount };
  }

  @Delete('delete/:shortUrl')
  @HttpCode(204)
  async remove(@Param('shortUrl') shortUrl: string) {
    await this.urlService.remove(shortUrl);
  }

  @Get('analytics/:shortUrl')
  async getAnalytics(@Param('shortUrl') shortUrl: string) {
    return this.urlService.getAnalytics(shortUrl);
  }
}
