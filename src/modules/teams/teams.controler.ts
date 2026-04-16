import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { BaseController } from '../../common/base/base.controller';
import { TeamsService } from './services';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dtos';

@Controller('v1/teams')
export class TeamsController extends BaseController {
  constructor(private readonly teamsService: TeamsService) {
    super();
  }

  @Post()
  async create(@Body() createDto: CreateTeamDto, req: any) {
    return this.createResponse(
      () => this.teamsService.createTeam(req.user.id, createDto),
      'Team created successfully'
    );
  }

  @Get()
  async findAll(req: any) {
    const teams = await this.teamsService.findUserTeams(req.user.id);
    return this.success(teams, 'Teams retrieved successfully');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateTeamDto) {
    return this.updateResponse(
      () => this.teamsService.update(id, updateDto),
      'Team updated successfully'
    );
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() dto: AddTeamMemberDto) {
    return this.execute(
      () => this.teamsService.addMember(id, dto),
      'Member added successfully'
    );
  }
}