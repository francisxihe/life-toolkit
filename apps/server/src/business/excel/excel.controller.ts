import { Controller, Get, Post, UploadedFile, UseInterceptors, Query, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.excelService.processExcelFile(file);
  }

  @Get()
  async getData(@Query('search') search: string) {
    return this.excelService.getData(search);
  }

  @Get('stats')
  async getStats() {
    return this.excelService.getStats();
  }

  @Get('record-counts')
  async getRecordCounts() {
    return this.excelService.getRecordCounts();
  }

  @Get('export')
  async exportData() {
    return this.excelService.exportToExcel();
  }

  @Delete('cleanup/:days')
  async cleanupOldData(@Param('days') days: number) {
    return this.excelService.cleanupOldData(days);
  }
}