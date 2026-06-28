
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  slug: 'slug',
  emailVerified: 'emailVerified',
  image: 'image',
  passwordHash: 'passwordHash',
  phone: 'phone',
  role: 'role',
  previousRole: 'previousRole',
  packageType: 'packageType',
  packageExpiry: 'packageExpiry',
  isApproved: 'isApproved',
  isVerified: 'isVerified',
  contactConsent: 'contactConsent',
  verificationCode: 'verificationCode',
  verificationExpiry: 'verificationExpiry',
  fullName: 'fullName',
  city: 'city',
  bio: 'bio',
  photo: 'photo',
  trustScore: 'trustScore',
  completedTrips: 'completedTrips',
  isMuted: 'isMuted',
  mutedUntil: 'mutedUntil',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  tokenBalance: 'tokenBalance',
  avgResponseHours: 'avgResponseHours',
  isIdentityVerified: 'isIdentityVerified',
  lastPlanChangeAt: 'lastPlanChangeAt',
  planFreezeUntil: 'planFreezeUntil',
  trustScoreVersion: 'trustScoreVersion',
  isTwoFactorEnabled: 'isTwoFactorEnabled',
  twoFactorSecret: 'twoFactorSecret',
  twoFactorRecoveryCodes: 'twoFactorRecoveryCodes',
  isPhoneVerified: 'isPhoneVerified',
  agencyCity: 'agencyCity',
  hasCompletedQuiz: 'hasCompletedQuiz',
  lastQuizAttempt: 'lastQuizAttempt',
  quizAttempts: 'quizAttempts',
  quizPassed: 'quizPassed',
  hasClaimedQuizBonus: 'hasClaimedQuizBonus',
  profileCompletedAt: 'profileCompletedAt',
  hasClaimedProfileBonus: 'hasClaimedProfileBonus',
  coverImage: 'coverImage',
  establishmentYear: 'establishmentYear',
  socialLinks: 'socialLinks',
  tursabNumber: 'tursabNumber'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.GuideProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  quotaTarget: 'quotaTarget',
  currentCount: 'currentCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  averageRating: 'averageRating',
  reviewCount: 'reviewCount',
  experienceYears: 'experienceYears',
  languagesSpoken: 'languagesSpoken',
  specialties: 'specialties',
  videoIntroduction: 'videoIntroduction'
};

exports.Prisma.DepartureCityScalarFieldEnum = {
  id: 'id',
  name: 'name',
  airport: 'airport',
  priority: 'priority'
};

exports.Prisma.AirlineScalarFieldEnum = {
  id: 'id',
  name: 'name',
  isCharterFriendly: 'isCharterFriendly'
};

exports.Prisma.GuideListingScalarFieldEnum = {
  id: 'id',
  guideId: 'guideId',
  title: 'title',
  description: 'description',
  city: 'city',
  departureCityId: 'departureCityId',
  meetingCity: 'meetingCity',
  extraServices: 'extraServices',
  hotelName: 'hotelName',
  airlineId: 'airlineId',
  pricingDouble: 'pricingDouble',
  pricingTriple: 'pricingTriple',
  pricingQuad: 'pricingQuad',
  pricingCurrency: 'pricingCurrency',
  quota: 'quota',
  filled: 'filled',
  active: 'active',
  deletedAt: 'deletedAt',
  isFeatured: 'isFeatured',
  startDate: 'startDate',
  departureDateEnd: 'departureDateEnd',
  endDate: 'endDate',
  returnDateEnd: 'returnDateEnd',
  totalDays: 'totalDays',
  approvalStatus: 'approvalStatus',
  rejectionReason: 'rejectionReason',
  urgencyTag: 'urgencyTag',
  legalConsent: 'legalConsent',
  consentTimestamp: 'consentTimestamp',
  image: 'image',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  category: 'category'
};

exports.Prisma.ListingCategoryScalarFieldEnum = {
  slug: 'slug',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ListingSeoScalarFieldEnum = {
  listingId: 'listingId',
  city: 'city',
  duration: 'duration',
  hotelType: 'hotelType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TourDayScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  day: 'day',
  city: 'city',
  title: 'title',
  description: 'description'
};

exports.Prisma.UmrahRequestScalarFieldEnum = {
  id: 'id',
  userEmail: 'userEmail',
  departureCity: 'departureCity',
  peopleCount: 'peopleCount',
  dateRange: 'dateRange',
  roomType: 'roomType',
  budget: 'budget',
  note: 'note',
  contactViaEmail: 'contactViaEmail',
  contactViaPhone: 'contactViaPhone',
  contactViaChat: 'contactViaChat',
  createdAt: 'createdAt',
  status: 'status',
  deletedAt: 'deletedAt'
};

exports.Prisma.LeadRoutingLogScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  currentWave: 'currentWave',
  status: 'status',
  offersReceived: 'offersReceived',
  dispatchedTo: 'dispatchedTo',
  nextWaveAt: 'nextWaveAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RequestInterestScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  guideEmail: 'guideEmail',
  threadId: 'threadId',
  createdAt: 'createdAt'
};

exports.Prisma.OfferScalarFieldEnum = {
  id: 'id',
  guideId: 'guideId',
  requestId: 'requestId',
  price: 'price',
  currency: 'currency',
  message: 'message',
  status: 'status',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RequestFavoriteScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  guideId: 'guideId',
  userId: 'userId',
  createdAt: 'createdAt',
  lastMessageAt: 'lastMessageAt',
  requestId: 'requestId'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  senderId: 'senderId',
  role: 'role',
  body: 'body',
  blocked: 'blocked',
  createdAt: 'createdAt'
};

exports.Prisma.ModerationLogScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.CreditPackageScalarFieldEnum = {
  id: 'id',
  name: 'name',
  credits: 'credits',
  priceTRY: 'priceTRY',
  features: 'features',
  billingPeriod: 'billingPeriod',
  monthlyPrice: 'monthlyPrice',
  roleTarget: 'roleTarget',
  slug: 'slug',
  sortOrder: 'sortOrder'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  code: 'code',
  discountPercent: 'discountPercent',
  maxUses: 'maxUses',
  usedCount: 'usedCount',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  role: 'role',
  credits: 'credits',
  amountTRY: 'amountTRY',
  provider: 'provider',
  status: 'status',
  sessionId: 'sessionId',
  createdAt: 'createdAt',
  metadata: 'metadata',
  providerRef: 'providerRef'
};

exports.Prisma.SavedCardScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  provider: 'provider',
  cardToken: 'cardToken',
  userToken: 'userToken',
  last4: 'last4',
  brand: 'brand',
  expiryMonth: 'expiryMonth',
  expiryYear: 'expiryYear',
  isDefault: 'isDefault',
  createdAt: 'createdAt'
};

exports.Prisma.TokenTransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  entryType: 'entryType',
  amount: 'amount',
  referenceId: 'referenceId',
  idempotencyKey: 'idempotencyKey',
  adminId: 'adminId',
  reasonCode: 'reasonCode',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  remainingAmount: 'remainingAmount',
  accountId: 'accountId',
  counterpartyId: 'counterpartyId'
};

exports.Prisma.AutoReplenishConfigScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  status: 'status',
  threshold: 'threshold',
  packageId: 'packageId',
  monthlyCap: 'monthlyCap',
  monthlySpent: 'monthlySpent',
  monthlyResetAt: 'monthlyResetAt',
  cooldownMinutes: 'cooldownMinutes',
  lastTriggeredAt: 'lastTriggeredAt',
  failCount: 'failCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TokenReplenishLogScalarFieldEnum = {
  id: 'id',
  configId: 'configId',
  userId: 'userId',
  tokensGranted: 'tokensGranted',
  priceTRY: 'priceTRY',
  packageId: 'packageId',
  balanceBefore: 'balanceBefore',
  balanceAfter: 'balanceAfter',
  triggerSource: 'triggerSource',
  status: 'status',
  failReason: 'failReason',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.ActiveBoostScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  userId: 'userId',
  effectivePower: 'effectivePower',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  boostType: 'boostType'
};

exports.Prisma.ListingBoostCounterScalarFieldEnum = {
  listingId: 'listingId',
  boostCount24h: 'boostCount24h',
  windowStartedAt: 'windowStartedAt'
};

exports.Prisma.WebhookEventScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  eventType: 'eventType',
  processedAt: 'processedAt',
  status: 'status',
  error: 'error'
};

exports.Prisma.IdentityApplicationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  status: 'status',
  idDocumentUrl: 'idDocumentUrl',
  certificateUrl: 'certificateUrl',
  contactEmail: 'contactEmail',
  note: 'note',
  reviewedBy: 'reviewedBy',
  reviewedAt: 'reviewedAt',
  rejectionReason: 'rejectionReason',
  revokedReason: 'revokedReason',
  packageAtApply: 'packageAtApply',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  guideId: 'guideId',
  reviewerUserId: 'reviewerUserId',
  requestId: 'requestId',
  ratingCommunication: 'ratingCommunication',
  ratingKnowledge: 'ratingKnowledge',
  ratingOrganization: 'ratingOrganization',
  ratingTimeManagement: 'ratingTimeManagement',
  overallRating: 'overallRating',
  positiveTags: 'positiveTags',
  negativeTags: 'negativeTags',
  comment: 'comment',
  status: 'status',
  isVerified: 'isVerified',
  ipHash: 'ipHash',
  userAgentHash: 'userAgentHash',
  createdAt: 'createdAt',
  approvedAt: 'approvedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.RiskScoreScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  urs: 'urs',
  tier: 'tier',
  behaviorScore: 'behaviorScore',
  transactionScore: 'transactionScore',
  networkScore: 'networkScore',
  historyScore: 'historyScore',
  signals: 'signals',
  whitelistedUntil: 'whitelistedUntil',
  probationUntil: 'probationUntil',
  probationBaseline: 'probationBaseline',
  escalationCount: 'escalationCount',
  updatedAt: 'updatedAt'
};

exports.Prisma.RiskEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventType: 'eventType',
  severity: 'severity',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.DeviceFingerprintScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  fingerprint: 'fingerprint',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.FraudReviewTicketScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  agencyId: 'agencyId',
  riskTier: 'riskTier',
  ursScore: 'ursScore',
  triggerReason: 'triggerReason',
  signals: 'signals',
  status: 'status',
  resolution: 'resolution',
  reviewerAdminId: 'reviewerAdminId',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ListingImpressionScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  userId: 'userId',
  source: 'source',
  position: 'position',
  searchQuery: 'searchQuery',
  createdAt: 'createdAt'
};

exports.Prisma.ListingClickScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  userId: 'userId',
  source: 'source',
  impressionId: 'impressionId',
  dwellTimeMs: 'dwellTimeMs',
  createdAt: 'createdAt'
};

exports.Prisma.VelocityCounterScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  windowKey: 'windowKey',
  count: 'count',
  createdAt: 'createdAt'
};

exports.Prisma.CancellationRecordScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  counterpartyId: 'counterpartyId',
  requestId: 'requestId',
  listingId: 'listingId',
  cancelledBy: 'cancelledBy',
  reason: 'reason',
  severity: 'severity',
  daysBeforeDeparture: 'daysBeforeDeparture',
  trustPenalty: 'trustPenalty',
  isForceMajeure: 'isForceMajeure',
  createdAt: 'createdAt'
};

exports.Prisma.SLAMetricScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  metricType: 'metricType',
  valueMs: 'valueMs',
  createdAt: 'createdAt'
};

exports.Prisma.DynamicPriceEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  baseCost: 'baseCost',
  finalCost: 'finalCost',
  multiplier: 'multiplier',
  surgeReason: 'surgeReason',
  discountApplied: 'discountApplied',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.EnterpriseCreditLineScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  creditLimit: 'creditLimit',
  usedCredit: 'usedCredit',
  billingCycleDays: 'billingCycleDays',
  interestRate: 'interestRate',
  status: 'status',
  nextBillingAt: 'nextBillingAt',
  gracePeriodDays: 'gracePeriodDays',
  consecutiveLateCount: 'consecutiveLateCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CreditLineTransactionScalarFieldEnum = {
  id: 'id',
  creditLineId: 'creditLineId',
  userId: 'userId',
  type: 'type',
  amount: 'amount',
  balanceBefore: 'balanceBefore',
  balanceAfter: 'balanceAfter',
  note: 'note',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.PerformanceTierScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  currentTier: 'currentTier',
  monthlyRevenue30d: 'monthlyRevenue30d',
  conversionRate30d: 'conversionRate30d',
  responseScore30d: 'responseScore30d',
  compositeScore: 'compositeScore',
  discountPercent: 'discountPercent',
  bonusTokens: 'bonusTokens',
  lastEvaluatedAt: 'lastEvaluatedAt',
  tierChangedAt: 'tierChangedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SpotlightPlacementScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  userId: 'userId',
  city: 'city',
  slotIndex: 'slotIndex',
  startsAt: 'startsAt',
  expiresAt: 'expiresAt',
  rotationGroup: 'rotationGroup',
  impressions: 'impressions',
  clicks: 'clicks',
  tokenCost: 'tokenCost',
  status: 'status',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.SeoLandingPageScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  pageType: 'pageType',
  targetKeyword: 'targetKeyword',
  h1Title: 'h1Title',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  contentHtml: 'contentHtml',
  searchParams: 'searchParams',
  isIndexed: 'isIndexed',
  viewCount: 'viewCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NewsletterSubscriberScalarFieldEnum = {
  id: 'id',
  email: 'email',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.ChatbotTemplateScalarFieldEnum = {
  id: 'id',
  question: 'question',
  answer: 'answer',
  isActive: 'isActive',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  isRead: 'isRead',
  referenceId: 'referenceId',
  createdAt: 'createdAt'
};

exports.Prisma.TestLogScalarFieldEnum = {
  id: 'id',
  scenarioName: 'scenarioName',
  status: 'status',
  errorMessage: 'errorMessage',
  testerName: 'testerName',
  duration: 'duration',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.GuideArticleScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  excerpt: 'excerpt',
  content: 'content',
  coverImage: 'coverImage',
  category: 'category',
  youtubeVideoId: 'youtubeVideoId',
  authorId: 'authorId',
  isPublished: 'isPublished',
  viewCount: 'viewCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  GUIDE: 'GUIDE',
  ORGANIZATION: 'ORGANIZATION',
  ADMIN: 'ADMIN',
  BANNED: 'BANNED'
};

exports.PackageTier = exports.$Enums.PackageTier = {
  FREEMIUM: 'FREEMIUM',
  PREMIUM: 'PREMIUM',
  PRO: 'PRO',
  BUSINESS: 'BUSINESS'
};

exports.ApprovalStatus = exports.$Enums.ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.PaymentProvider = exports.$Enums.PaymentProvider = {
  STRIPE: 'STRIPE',
  PAYTR: 'PAYTR',
  IYZICO: 'IYZICO'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.LedgerEntryType = exports.$Enums.LedgerEntryType = {
  PURCHASE: 'PURCHASE',
  CONSUME: 'CONSUME',
  REFUND: 'REFUND',
  ADJUSTMENT: 'ADJUSTMENT'
};

exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  GuideProfile: 'GuideProfile',
  DepartureCity: 'DepartureCity',
  Airline: 'Airline',
  GuideListing: 'GuideListing',
  ListingCategory: 'ListingCategory',
  ListingSeo: 'ListingSeo',
  TourDay: 'TourDay',
  UmrahRequest: 'UmrahRequest',
  LeadRoutingLog: 'LeadRoutingLog',
  RequestInterest: 'RequestInterest',
  Offer: 'Offer',
  RequestFavorite: 'RequestFavorite',
  Conversation: 'Conversation',
  Message: 'Message',
  ModerationLog: 'ModerationLog',
  CreditPackage: 'CreditPackage',
  Coupon: 'Coupon',
  Transaction: 'Transaction',
  SavedCard: 'SavedCard',
  TokenTransaction: 'TokenTransaction',
  AutoReplenishConfig: 'AutoReplenishConfig',
  TokenReplenishLog: 'TokenReplenishLog',
  ActiveBoost: 'ActiveBoost',
  ListingBoostCounter: 'ListingBoostCounter',
  WebhookEvent: 'WebhookEvent',
  IdentityApplication: 'IdentityApplication',
  Review: 'Review',
  RiskScore: 'RiskScore',
  RiskEvent: 'RiskEvent',
  DeviceFingerprint: 'DeviceFingerprint',
  FraudReviewTicket: 'FraudReviewTicket',
  ListingImpression: 'ListingImpression',
  ListingClick: 'ListingClick',
  VelocityCounter: 'VelocityCounter',
  CancellationRecord: 'CancellationRecord',
  SLAMetric: 'SLAMetric',
  DynamicPriceEvent: 'DynamicPriceEvent',
  EnterpriseCreditLine: 'EnterpriseCreditLine',
  CreditLineTransaction: 'CreditLineTransaction',
  PerformanceTier: 'PerformanceTier',
  SpotlightPlacement: 'SpotlightPlacement',
  SeoLandingPage: 'SeoLandingPage',
  NewsletterSubscriber: 'NewsletterSubscriber',
  ChatbotTemplate: 'ChatbotTemplate',
  Notification: 'Notification',
  TestLog: 'TestLog',
  GuideArticle: 'GuideArticle'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
