import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class JestTestModule {
  static registerTests(testsToRegister,imports=[]): DynamicModule {
    return {
      module: JestTestModule,
      imports,
      providers: [...testsToRegister],
    };
  }
}
