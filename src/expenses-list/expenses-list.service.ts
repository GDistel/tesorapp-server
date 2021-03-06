import { ExpensesListResolution } from './interfaces';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ExpensesListRepository } from './expenses-list.repository';
import { GetExpensesListFilterDto } from './dto/get-expenses-list-filter.dto';
import { CreateExpensesListDto } from './dto/create-expenses-list.dto';
import { User } from '../auth/user.entity';
import { ExpensesList } from './expenses-list.entity';
import { UpdateExpensesListDto } from './dto/update-expenses-list.dto';
import { ExpenseService } from '../expense/expense.service';
import { ParticipantService } from '../participant/participant.service';
import { GetExpenseFilterDto } from '../expense/dto/get-expense-filter.dto';
import { Participant } from '../participant/participant.entity';
import { Expense } from '../expense/expense.entity';
import { CreateOrUpdateParticipantDto } from '../participant/dto/create-update-participant.dto';
import { PagedResponse, Pagination } from '../shared';
import { CreateExpenseDto } from '../expense/dto/create-expense.dto';
import { ExpensesSettler } from './expenses-list-settler';

@Injectable()
export class ExpensesListService {
    constructor(
        @InjectRepository(ExpensesListRepository)
        private expensesListRepository: ExpensesListRepository,
        private expenseService: ExpenseService,
        @Inject(forwardRef(() => ParticipantService))
        private participantService: ParticipantService
    ) {}

    async getExpensesLists(
        filterDto: GetExpensesListFilterDto, user: User, pagination: Pagination
    ): Promise<PagedResponse<ExpensesList[]>> {
        return this.expensesListRepository.getExpensesLists(filterDto, user, pagination);
    }

    async getExpensesListRelatedExpenses(
        id: number, user: User, filterDto: GetExpenseFilterDto, pagination: Pagination
    ): Promise<PagedResponse<Expense[]>> {
        return this.expenseService.getExpenses(filterDto, user, pagination, id);
    }

    async createExpensesListExpense(
        id: number, createExpenseDto: CreateExpenseDto, user: User
    ): Promise<Expense> {
        const expensesList = await this.getExpensesListById(id, user);
        const participants = await this.participantService.getParticipants(user, expensesList.id);
        const expenseParticipants = participants.filter(
            participant => createExpenseDto.participantIds.includes(participant.id)
        );
        return this.expenseService.createExpense(createExpenseDto, user, expensesList, expenseParticipants);
    }

    async getExpensesListRelatedParticipants(id: number, user: User): Promise<Participant[]> {
        return this.participantService.getParticipants(user, id);
    }

    async createExpensesListParticipant(
        id: number, createParticipantDto: CreateOrUpdateParticipantDto, user: User
    ): Promise<Participant> {
        const expensesList = await this.getExpensesListById(id, user);
        return this.participantService.createParticipant(createParticipantDto, expensesList, user);
    }

    async getExpensesListById(id: number, user: User): Promise<ExpensesList> {
        const found = await this.expensesListRepository.findOne({ where: { id, userId: user.id } });
        if (!found) {
            throw new NotFoundException(`Expenses list with ID "${id}" not found`);
        }
        delete found.expenses;
        return found;
    }

    async getExpensesListResolution(id: number, user: User): Promise<ExpensesListResolution> {
        const expensesList = await this.expensesListRepository.findOne({ where: { id } });
        if (!expensesList) {
            throw new NotFoundException(`Expenses list with ID "${id}" not found`);
        }
        const pagination = new Pagination(0, 0); // (0, 0) to get all items
        const expenses = await this.expenseService.getExpenses({} as GetExpenseFilterDto, user, pagination, id);
        if (!expenses || !expenses.items.length) {
            throw new NotFoundException(`Could not find any expenses for the expenses list with ID "${id}"`);
        }
        const expensesSettler = new ExpensesSettler(expenses.items, expensesList.participants);
        const expensesListResolution: ExpensesListResolution = {
            status: expensesSettler.participantsDebtStatus,
            settle: expensesSettler.participantsSettlements
        };
        return expensesListResolution;
    }

    async createExpensesList(createExpensesListDto: CreateExpensesListDto, user: User): Promise<ExpensesList> {
        return this.expensesListRepository.createExpensesList(createExpensesListDto, user);
    }

    async deleteExpensesList(id: number, user: User): Promise<void> {
        const result = await this.expensesListRepository.delete({ id, userId: user.id });
        if (result.affected === 0) {
            throw new NotFoundException(`ExpensesList with ID "${id}" not found`);
        }
    }

    async updateExpensesList(
        id: number, updateExpensesListDto: UpdateExpensesListDto, user: User
    ): Promise<ExpensesList> {
        const expensesList = await this.getExpensesListById(id, user);
        if (updateExpensesListDto.name) {
            expensesList.name = updateExpensesListDto.name;
        }
        if (updateExpensesListDto.description) {
            expensesList.description = updateExpensesListDto.description;
        }
        if (updateExpensesListDto.status) {
            expensesList.status = updateExpensesListDto.status;
        }
        if (updateExpensesListDto.currency) {
            expensesList.currency = updateExpensesListDto.currency;
        }
        await expensesList.save();
        return expensesList;
    }
}

