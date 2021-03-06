import { ExpensesListResolution } from './interfaces';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Query,
    Patch,
    Post,
    UsePipes,
    ValidationPipe,
    ParseIntPipe,
    UseGuards,
    Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreateExpensesListDto } from './dto/create-expenses-list.dto';
import { GetExpensesListFilterDto } from './dto/get-expenses-list-filter.dto';
import { ExpensesList } from './expenses-list.entity';
import { ExpensesListService } from './expenses-list.service';
import { UpdateExpensesListDto } from './dto/update-expenses-list.dto';
import { Expense } from '../expense/expense.entity';
import { GetExpenseFilterDto } from '../expense/dto/get-expense-filter.dto';
import { Participant } from '../participant/participant.entity';
import { CreateOrUpdateParticipantDto } from '../participant/dto/create-update-participant.dto';
import { PagedResponse, GetPagination, Pagination } from '../shared';
import { CreateExpenseDto } from '../expense/dto/create-expense.dto';

@Controller('expenses-list')
@UseGuards(AuthGuard())
export class ExpensesListController {

    constructor(private expensesListService: ExpensesListService) {}

    @Get()
    getExpensesLists(
        @Query(ValidationPipe) filterDto: GetExpensesListFilterDto,
        @GetPagination() pagination: Pagination,
        @GetUser() user: User
    ): Promise<PagedResponse<ExpensesList[]>> {
        return this.expensesListService.getExpensesLists(filterDto, user, pagination);
    }

    @Get('/:id')
    getExpensesListById(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<ExpensesList> {
        return this.expensesListService.getExpensesListById(id, user);
    }

    @Get('/:id/resolve')
    getExpensesListResolution(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ): Promise<ExpensesListResolution> {
        return this.expensesListService.getExpensesListResolution(id, user);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createExpensesList(
        @Body() createExpensesListDto: CreateExpensesListDto,
        @GetUser() user: User
    ): Promise<ExpensesList> {
        return this.expensesListService.createExpensesList(createExpensesListDto, user);
    }

    @Delete('/:id')
    deleteExpensesList(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<void> {
        return this.expensesListService.deleteExpensesList(id, user);
    }

    @Patch('/:id')
    updateExpensesList(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateExpensesListDto: UpdateExpensesListDto,
        @GetUser() user: User
    ): Promise<ExpensesList> {
        return this.expensesListService.updateExpensesList(id, updateExpensesListDto, user);
    }

    @Get('/:id/expenses')
    getExpensesListRelatedExpenses(
        @Param('id', ParseIntPipe) id: number,
        @Query(ValidationPipe) filterDto: GetExpenseFilterDto,
        @GetPagination() pagination: Pagination,
        @GetUser() user: User
    ): Promise<PagedResponse<Expense[]>> {
        return this.expensesListService.getExpensesListRelatedExpenses(id, user, filterDto, pagination);
    }

    @Post('/:id/expenses')
    createExpensesListExpense(
        @Param('id', ParseIntPipe) id: number,
        @Body() createExpenseDto: CreateExpenseDto,
        @GetUser() user: User
    ): Promise<Expense> {
        return this.expensesListService.createExpensesListExpense(id, createExpenseDto, user);
    }

    @Get('/:id/participants')
    getExpensesListRelatedParticipants(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ): Promise<Participant[]> {
        return this.expensesListService.getExpensesListRelatedParticipants(id, user);
    }

    @Post('/:id/participants')
    createExpensesListParticipant(
        @Param('id', ParseIntPipe) id: number,
        @Body() createParticipantDto: CreateOrUpdateParticipantDto,
        @GetUser() user: User
    ): Promise<Participant> {
        return this.expensesListService.createExpensesListParticipant(id, createParticipantDto, user);
    }
}
