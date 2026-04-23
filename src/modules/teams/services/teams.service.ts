// src/teams/teams.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { BaseService } from '@common/base/base.service';
import { Team, TeamMember } from '../entities';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from '../dtos';

@Injectable()
export class TeamsService extends BaseService<Team, CreateTeamDto, UpdateTeamDto> {
  constructor(
    @InjectRepository(Team)
    protected readonly repository: Repository<Team>,

    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,


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
    return this.repository
      .createQueryBuilder('team')
      .leftJoin('team_members', 'tm', 'tm.teamId = team.id AND tm.userId = :userId', { userId })
      .orderBy('team.createdAt', 'DESC')
      .getMany();
  }

  async addMember(teamId: string, dto: AddTeamMemberDto) {
    const team = await this.findOne(teamId);

    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      // invite the user if they don't exist already and on their confirmation, they will go on and update their details
      throw new NotFoundException('User not found');
    }

    // Add logic for team membership (ManyToMany or separate TeamMember table)
    // For simplicity, we'll assume a members relation exists

    const teamMember = this.teamMemberRepository.create({
      userId: user.id,
      teamId: team.id,
      role: dto.role,
    });
    await this.teamMemberRepository.save(teamMember);

    return team;
  }

  async removeMember(teamId: string, userId: string) {
    const team = await this.findOne(teamId);
    return await this.teamMemberRepository.delete({userId})
  }
}