import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVaribles {
  @IsString()
  DB_URL: string;

  @IsNumber()
  PORT: number;

  @IsString()
  REDIS_URL: string;

  @IsString()
  ORDER_CREATED: string;

  @IsString()
  PAYMENT_VERIFIED: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVaribles, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
