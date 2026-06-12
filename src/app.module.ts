import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@shared/infrastructure/database/typeorm.config';
import { HealthModule } from '@shared/infrastructure/health/health.module';
import { MetricsModule } from '@shared/observability/metrics/metrics.module';
import { LoggingModule } from '@shared/infrastructure/logging/logging.module';
import { LoggingInterceptor } from '@shared/infrastructure/logging/logging.interceptor';
import { CorrelationIdMiddleware } from '@shared/infrastructure/logging/correlation-id.middleware';
import { ProductModule } from '@modules/product/product.module';
import { CustomerModule } from '@modules/customer/customer.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { PaymentTypeModule } from '@modules/payment-type/payment-type.module';
import { OrderModule } from '@modules/order/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    HealthModule,
    MetricsModule,
    LoggingModule,
    ProductModule,
    CustomerModule,
    InventoryModule,
    PaymentTypeModule,
    OrderModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
