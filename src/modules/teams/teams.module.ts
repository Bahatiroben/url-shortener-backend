import { Module } from '@nestjs/common';
import { UserModule } from '@modules/users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team, TeamMember } from './entities';
import { TeamsService } from './services';
import { TeamsController } from './teams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember]), UserModule],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}