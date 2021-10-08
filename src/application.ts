import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {
  AuthorizationComponent,
  AuthorizationDecision,
  AuthorizationTags,
} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {Application, ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestBindings, RestComponent, RestServer} from '@loopback/rest';
import {CrudRestComponent} from '@loopback/rest-crud';
import {RestExplorerBindings} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {
  EntityComponent,
  RestExplorerComponent,
  ValidatorsComponent,
} from './components';
import {ApiResourceProvider} from './providers/api-resource.provider';
import {SubscriberAuthorizationProvider} from './providers/subscriber-authorization.provider';
import {MySequence} from './sequence';
import {RabbitmqServer} from './servers';
import {JWTService} from './services/auth/jwt.service';

export {ApplicationConfig};

export class MicroCatalogApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(Application)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    options.rest.sequence = MySequence;

    this.component(RestComponent);
    const restServer = this.getSync<RestServer>('servers.RestServer');

    restServer.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.bind(RestBindings.SequenceActions.SEND).toProvider(
      ApiResourceProvider,
    );
    this.component(RestExplorerComponent);
    this.component(EntityComponent);
    this.component(ValidatorsComponent);
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    const bindings = this.component(AuthorizationComponent);
    this.configure(bindings.key).to({
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.DENY,
    });
    this.bind('authorizationProviders.subscriber-provider')
      .toProvider(SubscriberAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.server(RabbitmqServer);
    this.component(CrudRestComponent);
  }

  async boot() {
    await super.boot();
    // const validator = this.getSync<ValidatorService>('services.ValidatorService');
    // try {
    //     await validator.validate({
    //         data: {},
    //         entityClass: Category
    //     });
    // } catch (e) {
    //     console.dir(e, {depth: 8});
    // }

    // try {
    //     await validator.validate({
    //         data: {},
    //         entityClass: Genre
    //     })
    // } catch (e) {
    //     console.dir(e, {depth: 8})
    // }
  }
}
