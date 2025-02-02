import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { read, utils, writeFile } from 'xlsx';
import { ExcelData } from './excel-data.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ExcelService {
  constructor(
    @InjectRepository(ExcelData)
    private excelRepository: Repository<ExcelData>,
    private dataSource: DataSource
  ) {}

  async processExcelFile(file: Express.Multer.File) {
    const workbook = read(file.buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

    const excelData = this.excelRepository.create({
      filename: file.originalname,
      data: jsonData,
    });

    return this.excelRepository.save(excelData);
  }

  async getData(search?: string) {
    if (search) {
      // Using stored procedure for search
      const result = await this.dataSource.query(
        'CALL search_excel_data(?)',
        [search]
      );
      return result[0];
    }
    return this.excelRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const stats = await this.dataSource.query('SELECT * FROM excel_stats LIMIT 7');
    return stats;
  }

  async exportToExcel() {
    const data = await this.excelRepository.find();
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');

    const buffer = writeFile(wb, "demo.xlsx", { type: "buffer" });
    return buffer;
  }

  async cleanupOldData(daysToKeep: number = 30) {
    await this.dataSource.query('CALL cleanup_old_data(?)', [daysToKeep]);
  }

  async getRecordCounts() {
    return this.dataSource.query(`
      SELECT 
        filename,
        JSON_LENGTH(data) as record_count,
        created_at
      FROM excel_data
      ORDER BY created_at DESC
    `);
  }
}