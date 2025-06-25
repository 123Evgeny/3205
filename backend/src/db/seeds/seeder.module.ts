import { Module } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from '../../url/url.entity';
import { Analytics } from '../../url/analytics.entity';
import { UrlService } from '../../url/url.service';
import { UrlSeederService } from './url.seeder';

@Module({
  imports: [AppModule, TypeOrmModule.forFeature([Url, Analytics])],
  providers: [UrlSeederService, UrlService],
})
export class SeederModule {} 