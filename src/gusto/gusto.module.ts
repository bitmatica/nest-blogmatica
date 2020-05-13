import { HttpModule, Module } from '@nestjs/common'
import { GustoResolver } from './gusto.resolver'
import { GustoService } from './gusto.service'
import { OAuthModule } from '../oauth/oauth.module'

@Module({
  imports: [HttpModule, OAuthModule],
  providers: [GustoService, GustoResolver],
})
export class GustoModule {}
