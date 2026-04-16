// src/teams/teams.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/base/base.service';
import { Team } from '../entities/team.entity';
import { User } from '../../users/entities/user.entity';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from '../dtos';

@Injectable()
export class TeamsService extends BaseService<Team, CreateTeamDto, UpdateTeamDto> {
  constructor(
    @InjectRepository(Team)
    protected readonly repository: Repository<Team>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(repository);
  }

  async createTeam(userId: string, createDto: CreateTeamDto): Promise<Team> {
    const team = this.repository.create({
      ...createDto,
      ownerId: userId,
    });

    return await this.repository.save(team);
  }

  async findUserTeams(userId: string) {
    return this.repository.find({
      where: [
        { ownerId: userId },
        { members: { id: userId } }   // If you have ManyToMany relation
      ],
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async addMember(teamId: string, dto: AddTeamMemberDto) {
    const team = await this.findOne(teamId);

    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add logic for team membership (ManyToMany or separate TeamMember table)
    // For simplicity, we'll assume a members relation exists

    return team;
  }

  async removeMember(teamId: string, userId: string) {
    const team = await this.findOne(teamId);
    // Implement removal logic
    return team;
  }
}