import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ExpensesListModule } from 'src/expenses-list/expenses-list.module';
import { ExpensesListRepository } from 'src/expenses-list/expenses-list.repository';
import { ExpensesListService } from 'src/expenses-list/expenses-list.service';
import { ExpenseController } from './expense.controller';
import { ExpenseRepository } from './expense.repository';
import { ExpenseService } from './expense.service';

const TypeOrmForExpenseRepository = TypeOrmModule.forFeature([ExpenseRepository]);

@Module({
  imports: [
    AuthModule,
    TypeOrmForExpenseRepository,
    forwardRef(() => ExpensesListModule)
  ],
  controllers: [ExpenseController],
  providers: [
    ExpenseService
  ],
  exports: [
    TypeOrmForExpenseRepository,
    ExpenseService
  ]
})
export class ExpenseModule {}
