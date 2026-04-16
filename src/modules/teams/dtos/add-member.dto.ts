import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { TeamRole } from '../enums';

export class AddTeamMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(TeamRole)
  role: TeamRole = TeamRole.VIEWER;
}