import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkspaceAccessGuard } from './common/guards/workspace-access.guard';
import { WorkspaceMiddleware } from './common/middleware/workspace.middleware';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { CardsModule } from './modules/cards/cards.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    AccountsModule,
    CardsModule,
    CategoriesModule,
    TransactionsModule,
    ReportsModule,
  ],
  providers: [WorkspaceAccessGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WorkspaceMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
