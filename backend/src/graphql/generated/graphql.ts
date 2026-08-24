import { GraphQLResolveInfo } from 'graphql';
import { GraphQLContext } from '../context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type Comment = {
  __typename?: 'Comment';
  author: User;
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ticketId: Scalars['ID']['output'];
};

export type Holiday = {
  __typename?: 'Holiday';
  createdAt: Scalars['String']['output'];
  date: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addComment: Comment;
  assignTicket: Ticket;
  changeTicketStatus: Ticket;
  createTicket: Ticket;
  login: AuthPayload;
  register: AuthPayload;
  resolveTicket: Ticket;
};


export type MutationAddCommentArgs = {
  content: Scalars['String']['input'];
  ticketId: Scalars['ID']['input'];
};


export type MutationAssignTicketArgs = {
  assigneeId: Scalars['ID']['input'];
  ticketId: Scalars['ID']['input'];
};


export type MutationChangeTicketStatusArgs = {
  status: TicketStatus;
  ticketId: Scalars['ID']['input'];
};


export type MutationCreateTicketArgs = {
  description: Scalars['String']['input'];
  priority: Priority;
  title: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: UserRole;
};


export type MutationResolveTicketArgs = {
  ticketId: Scalars['ID']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum Priority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM',
  Urgent = 'URGENT'
}

export type Query = {
  __typename?: 'Query';
  dashboard: TicketDashboard;
  holidays: Array<Holiday>;
  me?: Maybe<User>;
  ticket?: Maybe<Ticket>;
  tickets: TicketConnection;
  users: Array<User>;
};


export type QueryTicketArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTicketsArgs = {
  assigneeId?: InputMaybe<Scalars['ID']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Priority>;
  slaState?: InputMaybe<SlaState>;
  status?: InputMaybe<TicketStatus>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUsersArgs = {
  role?: InputMaybe<UserRole>;
};

export type SlaInfo = {
  __typename?: 'SLAInfo';
  firstResponseDueAt: Scalars['String']['output'];
  firstResponseRemainingMinutes: Scalars['Int']['output'];
  firstResponseState: SlaState;
  resolutionDueAt: Scalars['String']['output'];
  resolutionRemainingMinutes: Scalars['Int']['output'];
  resolutionState: SlaState;
};

export enum SlaState {
  AtRisk = 'AT_RISK',
  Breached = 'BREACHED',
  OnTrack = 'ON_TRACK'
}

export type Ticket = {
  __typename?: 'Ticket';
  assignee?: Maybe<User>;
  comments: Array<Comment>;
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  firstResponseAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  priority: Priority;
  reporter: User;
  resolvedAt?: Maybe<Scalars['String']['output']>;
  sla: SlaInfo;
  status: TicketStatus;
  title: Scalars['String']['output'];
};

export type TicketConnection = {
  __typename?: 'TicketConnection';
  nodes: Array<Ticket>;
  pageInfo: PageInfo;
};

export type TicketDashboard = {
  __typename?: 'TicketDashboard';
  atRiskTickets: Scalars['Int']['output'];
  breachedTickets: Scalars['Int']['output'];
  inProgressTickets: Scalars['Int']['output'];
  openTickets: Scalars['Int']['output'];
};

export enum TicketStatus {
  Closed = 'CLOSED',
  InProgress = 'IN_PROGRESS',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: UserRole;
};

export enum UserRole {
  Agent = 'AGENT',
  Reporter = 'REPORTER'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AuthPayload: ResolverTypeWrapper<AuthPayload>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Comment: ResolverTypeWrapper<Comment>;
  Holiday: ResolverTypeWrapper<Holiday>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Priority: Priority;
  Query: ResolverTypeWrapper<{}>;
  SLAInfo: ResolverTypeWrapper<SlaInfo>;
  SLAState: SlaState;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Ticket: ResolverTypeWrapper<Ticket>;
  TicketConnection: ResolverTypeWrapper<TicketConnection>;
  TicketDashboard: ResolverTypeWrapper<TicketDashboard>;
  TicketStatus: TicketStatus;
  User: ResolverTypeWrapper<User>;
  UserRole: UserRole;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AuthPayload: AuthPayload;
  Boolean: Scalars['Boolean']['output'];
  Comment: Comment;
  Holiday: Holiday;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  PageInfo: PageInfo;
  Query: {};
  SLAInfo: SlaInfo;
  String: Scalars['String']['output'];
  Ticket: Ticket;
  TicketConnection: TicketConnection;
  TicketDashboard: TicketDashboard;
  User: User;
}>;

export type AuthPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = ResolversObject<{
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ticketId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type HolidayResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Holiday'] = ResolversParentTypes['Holiday']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationAddCommentArgs, 'content' | 'ticketId'>>;
  assignTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationAssignTicketArgs, 'assigneeId' | 'ticketId'>>;
  changeTicketStatus?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationChangeTicketStatusArgs, 'status' | 'ticketId'>>;
  createTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationCreateTicketArgs, 'description' | 'priority' | 'title'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  register?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'name' | 'password' | 'role'>>;
  resolveTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationResolveTicketArgs, 'ticketId'>>;
}>;

export type PageInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  dashboard?: Resolver<ResolversTypes['TicketDashboard'], ParentType, ContextType>;
  holidays?: Resolver<Array<ResolversTypes['Holiday']>, ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  ticket?: Resolver<Maybe<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryTicketArgs, 'id'>>;
  tickets?: Resolver<ResolversTypes['TicketConnection'], ParentType, ContextType, Partial<QueryTicketsArgs>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, Partial<QueryUsersArgs>>;
}>;

export type SlaInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SLAInfo'] = ResolversParentTypes['SLAInfo']> = ResolversObject<{
  firstResponseDueAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstResponseRemainingMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstResponseState?: Resolver<ResolversTypes['SLAState'], ParentType, ContextType>;
  resolutionDueAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resolutionRemainingMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resolutionState?: Resolver<ResolversTypes['SLAState'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TicketResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Ticket'] = ResolversParentTypes['Ticket']> = ResolversObject<{
  assignee?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  comments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstResponseAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Priority'], ParentType, ContextType>;
  reporter?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  resolvedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sla?: Resolver<ResolversTypes['SLAInfo'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TicketStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TicketConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TicketConnection'] = ResolversParentTypes['TicketConnection']> = ResolversObject<{
  nodes?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TicketDashboardResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TicketDashboard'] = ResolversParentTypes['TicketDashboard']> = ResolversObject<{
  atRiskTickets?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  breachedTickets?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  inProgressTickets?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  openTickets?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  Holiday?: HolidayResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SLAInfo?: SlaInfoResolvers<ContextType>;
  Ticket?: TicketResolvers<ContextType>;
  TicketConnection?: TicketConnectionResolvers<ContextType>;
  TicketDashboard?: TicketDashboardResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

