import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelController } from './excel.controller';
import { ExcelService } from './excel.service';
import { ExcelData } from './excel-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExcelData])],
  controllers: [ExcelController],
  providers: [ExcelService],
})
export class ExcelModule {}