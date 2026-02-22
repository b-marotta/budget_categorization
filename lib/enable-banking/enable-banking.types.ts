/* =====================================================
   PRIMITIVE ALIASES
===================================================== */

export type CurrencyCode = string
export type EndDate = string // ISO date
export type RequestedExecutionDate = string // ISO date
export type PaymentInformationId = string
export type ReferenceNumber = string
export type UnstructuredRemittanceInformation = string[]

/* =====================================================
   ENUMS
===================================================== */

export type PSUType = 'business' | 'personal'

export type AuthenticationApproach = 'DECOUPLED' | 'EMBEDDED' | 'REDIRECT'

export type AddressType =
    | 'Business'
    | 'Correspondence'
    | 'DeliveryTo'
    | 'MailTo'
    | 'POBox'
    | 'Postal'
    | 'Residential'
    | 'Statement'

export type BalanceStatus =
    | 'CLAV'
    | 'CLBD'
    | 'FWAV'
    | 'INFO'
    | 'ITAV'
    | 'ITBD'
    | 'OPAV'
    | 'OPBD'
    | 'OTHR'
    | 'PRCD'
    | 'VALU'
    | 'XPCD'

export type CashAccountType = 'CACC' | 'CARD' | 'CASH' | 'LOAN' | 'OTHR' | 'SVGS'

export type CategoryPurposeCode =
    | 'BONU'
    | 'CASH'
    | 'CBLK'
    | 'CCRD'
    | 'CORT'
    | 'DCRD'
    | 'DIVI'
    | 'DVPM'
    | 'EPAY'
    | 'FCOL'
    | 'GOVT'
    | 'HEDG'
    | 'ICCP'
    | 'IDCP'
    | 'INTC'
    | 'INTE'
    | 'LOAN'
    | 'MP2B'
    | 'MP2P'
    | 'OTHR'
    | 'PENS'
    | 'RPRE'
    | 'RRCT'
    | 'RVPM'
    | 'SALA'
    | 'SECU'
    | 'SSBE'
    | 'SUPP'
    | 'TAXS'
    | 'TRAD'
    | 'TREA'
    | 'VATX'
    | 'WHLD'

export type ChargeBearerCode = 'CRED' | 'DEBT' | 'SHAR' | 'SLEV'

export type CreditDebitIndicator = 'CRDT' | 'DBIT'

export type Environment = 'PRODUCTION' | 'SANDBOX'

export type ExecutionRule = 'FWNG' | 'PREC'

export type FrequencyCode = 'DAIL' | 'MNTH' | 'QUTR' | 'SEMI' | 'TOMN' | 'TOWK' | 'WEEK' | 'YEAR'

export type PaymentStatus =
    | 'ACCC'
    | 'ACCP'
    | 'ACCR'
    | 'ACPT'
    | 'ACSC'
    | 'ACSP'
    | 'ACTC'
    | 'ACWC'
    | 'ACWP'
    | 'CNCL'
    | 'NULL'
    | 'PACR'
    | 'PART'
    | 'PDCR'
    | 'PDNG'
    | 'RCVD'
    | 'RJCR'
    | 'RJCT'

export type PaymentType =
    | 'BULK_DOMESTIC'
    | 'BULK_DOMESTIC_SE_GIRO'
    | 'BULK_SEPA'
    | 'CROSSBORDER'
    | 'DOMESTIC'
    | 'DOMESTIC_SE_GIRO'
    | 'INST_SEPA'
    | 'INTERNAL'
    | 'SEPA'

export type PriorityCode = 'EXPR' | 'HIGH' | 'NORM'

export type PurposeCode = 'ACCT' | 'CASH' | 'COMC' | 'CPKC' | 'TRPT'

export type RateType = 'AGRD' | 'SALE' | 'SPOT'

export type ReferenceNumberScheme = 'BERF' | 'FIRF' | 'INTL' | 'NORF' | 'SDDM' | 'SEBG'

export type Service = 'AIS' | 'PIS'

export type SchemeName =
    | 'ARNU'
    | 'BANK'
    | 'BBAN'
    | 'BGNR'
    | 'CCPT'
    | 'CHID'
    | 'COID'
    | 'CPAN'
    | 'CUSI'
    | 'CUST'
    | 'DRLC'
    | 'DUNS'
    | 'EMPL'
    | 'GS1G'
    | 'IBAN'
    | 'MIBN'
    | 'NIDN'
    | 'OAUT'
    | 'OTHC'
    | 'OTHI'
    | 'PGNR'
    | 'SOSE'
    | 'SREN'
    | 'SRET'
    | 'TXID'

export type ServiceLevelCode =
    | 'BKTR'
    | 'G001'
    | 'G002'
    | 'G003'
    | 'G004'
    | 'NUGP'
    | 'NURG'
    | 'PRPT'
    | 'SDVA'
    | 'SEPA'
    | 'SVDE'
    | 'URGP'
    | 'URNS'

export type SessionStatus =
    | 'AUTHORIZED'
    | 'CANCELLED'
    | 'CLOSED'
    | 'EXPIRED'
    | 'INVALID'
    | 'PENDING_AUTHORIZATION'
    | 'RETURNED_FROM_BANK'
    | 'REVOKED'

export type TransactionStatus = 'BOOK' | 'CNCL' | 'HOLD' | 'OTHR' | 'PDNG' | 'RJCT' | 'SCHD'

export type TransactionsFetchStrategy = 'default' | 'longest'

export type Usage = 'ORGA' | 'PRIV'

/* =====================================================
   CORE MODELS
===================================================== */

export interface ASPSP {
    name: string
    country: string
}

export interface ASPSPGroup {
    name: string
    logo: string
}

export interface AmountType {
    currency: string
    amount: string
}

export interface GenericIdentification {
    identification: string
    scheme_name: SchemeName
    issuer?: string
}

export interface AccountIdentification {
    iban?: string
    other?: GenericIdentification
}

export interface ClearingSystemMemberIdentification {
    clearing_system_id?: string
    member_id?: string
}

export interface FinancialInstitutionIdentification {
    bic_fi?: string
    clearing_system_member_id?: ClearingSystemMemberIdentification
    name?: string
}

export interface ContactDetails {
    email_address?: string
    phone_number?: string
}

export interface PostalAddress {
    address_type?: AddressType
    department?: string
    sub_department?: string
    street_name?: string
    building_number?: string
    post_code?: string
    town_name?: string
    country_sub_division?: string
    country?: string
    address_line?: string[]
}

export interface PartyIdentification {
    name?: string
    postal_address?: PostalAddress
    organisation_id?: GenericIdentification
    private_id?: GenericIdentification
    contact_details?: ContactDetails
}

/* =====================================================
   ACCOUNT
===================================================== */

export interface AccountResource {
    account_id?: AccountIdentification
    all_account_ids?: GenericIdentification[]
    account_servicer?: FinancialInstitutionIdentification
    name?: string
    details?: string
    usage?: Usage
    cash_account_type: CashAccountType
    product?: string
    currency: CurrencyCode
    psu_status?: string
    credit_limit?: AmountType
    legal_age?: boolean | null
    postal_address?: PostalAddress
    uid?: string
    identification_hash: string
    identification_hashes: string[]
}

export interface BalanceResource {
    name: string
    balance_amount: AmountType
    balance_type: BalanceStatus
    last_change_date_time?: string
    reference_date?: string
    last_committed_transaction?: string
}

/* =====================================================
   AUTH
===================================================== */

export interface Access {
    accounts?: AccountIdentification[]
    balances?: boolean
    transactions?: boolean
    valid_until: string
}

export interface Credential {
    name: string
    title: string
    required: boolean
    description?: string
    template?: string
}

export interface AuthMethod {
    name?: string
    title?: string
    psu_type: PSUType
    credentials?: Credential[]
    approach: AuthenticationApproach
    hidden_method: boolean
}

export interface AuthorizeSessionRequest {
    code: string
}

export interface SessionAccount {
    uid: string
    identification_hash: string
    identification_hashes: string[]
}

export interface AuthorizeSessionResponse {
    session_id: string
    accounts: AccountResource[]
    aspsp: ASPSP
    psu_type: PSUType
    access: Access
}

export interface GetSessionResponse {
    status: SessionStatus
    accounts: string[]
    accounts_data: SessionAccount[]
    aspsp: ASPSP
    psu_type: PSUType
    psu_id_hash: string
    access: Access
    created: string
    authorized?: string
    closed?: string
}

export interface StartAuthorizationRequest {
    access: Access
    aspsp: ASPSP
    state: string
    redirect_url: string
    psu_type?: PSUType
    auth_method?: string
    credentials?: Record<string, string>
    credentials_autosubmit?: boolean
    language?: string
    psu_id?: string
}

export interface StartAuthorizationResponse {
    url: string
    authorization_id: string
    psu_id_hash: string
}

/* =====================================================
   PAYMENTS
===================================================== */

export interface Beneficiary {
    creditor_agent?: FinancialInstitutionIdentification
    creditor?: PartyIdentification
    creditor_account: GenericIdentification
    creditor_currency?: string
}

export interface PaymentIdentification {
    instruction_id?: string
    end_to_end_id?: string
}

export interface RegulatoryAuthority {
    country: string
    name: string
}

export interface RegulatoryReportingDetails {
    amount?: AmountType
    code?: string
    information: string
}

export interface RegulatoryReporting {
    authority?: RegulatoryAuthority
    details: RegulatoryReportingDetails
}

export interface RegulatoryReportingCode {
    value: string
    description: string
}

export interface RemittanceInformationLineInfo {
    min_length?: number
    max_length?: number
    pattern?: string
}

export interface CreditTransferTransaction {
    instructed_amount: AmountType
    beneficiary: Beneficiary
    payment_id?: PaymentIdentification
    requested_execution_date?: RequestedExecutionDate
    reference_number?: ReferenceNumber
    end_date?: EndDate
    execution_rule?: ExecutionRule
    frequency?: FrequencyCode
    ultimate_debtor?: PartyIdentification
    ultimate_creditor?: PartyIdentification
    regulatory_reporting?: RegulatoryReporting[]
    remittance_information?: UnstructuredRemittanceInformation
}

export interface CreditTransferTransactionDetails extends CreditTransferTransaction {
    transaction_id?: string
    transaction_status?: PaymentStatus
}

export interface PaymentTypeInformation {
    instruction_priority?: PriorityCode
    service_level?: ServiceLevelCode
    category_purpose?: CategoryPurposeCode
    local_instrument?: string
}

export interface PaymentRequestResource {
    payment_information_id?: PaymentInformationId
    payment_type_information?: PaymentTypeInformation
    debtor?: PartyIdentification
    debtor_account?: GenericIdentification
    debtor_agent?: FinancialInstitutionIdentification
    debtor_currency?: string
    purpose?: PurposeCode
    charge_bearer?: ChargeBearerCode
    credit_transfer_transaction: CreditTransferTransaction[]
}

export interface PaymentRequestResourceDetails {
    payment_information_id?: PaymentInformationId
    payment_type_information?: PaymentTypeInformation
    debtor?: PartyIdentification
    debtor_account?: GenericIdentification
    debtor_agent?: FinancialInstitutionIdentification
    debtor_currency?: string
    purpose?: PurposeCode
    charge_bearer?: ChargeBearerCode
    credit_transfer_transaction?: CreditTransferTransactionDetails[]
}

export interface CreatePaymentRequest {
    payment_type: PaymentType
    payment_request: PaymentRequestResource
    aspsp: ASPSP
    state: string
    redirect_url: string
    psu_type: PSUType
    auth_method?: string
    credentials?: Record<string, string>
    language?: string
    webhook_url?: string
}

export interface CreatePaymentResponse {
    payment_id: string
    status: PaymentStatus
    url: string
}

export interface StatusReasonInformation {
    status_reason_code: string
    status_reason_description: string
}

export interface GetPaymentResponse {
    payment_id: string
    status: PaymentStatus
    payment_details: PaymentRequestResourceDetails
    payment_type: PaymentType
    aspsp: ASPSP
    final_status: boolean
    status_reason_information?: StatusReasonInformation
}

export interface GetPaymentTransactionResponse {
    payment_id: string
    transaction_details: CreditTransferTransactionDetails
}

/* =====================================================
   TRANSACTIONS
===================================================== */

export interface BankTransactionCode {
    description?: string
    code?: string
    sub_code?: string
}

export interface ExchangeRate {
    unit_currency?: CurrencyCode
    exchange_rate?: string
    rate_type?: RateType
    contract_identification?: string
    instructed_amount?: AmountType
}

export interface Transaction {
    entry_reference?: string
    merchant_category_code?: string
    transaction_amount: AmountType
    creditor?: PartyIdentification
    creditor_account?: AccountIdentification
    creditor_agent?: FinancialInstitutionIdentification
    debtor?: PartyIdentification
    debtor_account?: AccountIdentification
    debtor_agent?: FinancialInstitutionIdentification
    bank_transaction_code?: BankTransactionCode
    credit_debit_indicator: CreditDebitIndicator
    status: TransactionStatus
    booking_date?: string
    value_date?: string
    transaction_date?: string
    balance_after_transaction?: AmountType
    reference_number?: ReferenceNumber
    reference_number_schema?: ReferenceNumberScheme
    remittance_information?: string[]
    debtor_account_additional_identification?: GenericIdentification[]
    creditor_account_additional_identification?: GenericIdentification[]
    exchange_rate?: ExchangeRate
    note?: string
    transaction_id?: string
}

export interface HalBalances {
    balances: BalanceResource[]
}

export interface HalTransactions {
    transactions: Transaction[]
    continuation_key?: string | null
}

/* =====================================================
   ASPSP EXTENDED
===================================================== */

export interface ResponsePaymentType {
    payment_type: PaymentType
    max_transactions?: number
    currencies?: CurrencyCode[]
    debtor_account_required?: boolean
    debtor_account_schemas?: SchemeName[]
    creditor_account_schemas?: SchemeName[]
    priority_codes?: PriorityCode[]
    charge_bearer_values?: ChargeBearerCode[]
    creditor_country_required?: boolean
    creditor_name_required?: boolean
    creditor_postal_address_required?: boolean
    remittance_information_required?: boolean
    remittance_information_lines?: RemittanceInformationLineInfo[]
    debtor_currency_required?: boolean
    debtor_contact_email_required?: boolean
    debtor_contact_phone_required?: boolean
    creditor_agent_bic_fi_required?: boolean
    creditor_agent_clearing_system_member_id_required?: boolean
    allowed_auth_methods?: string[]
    regulatory_reporting_codes?: RegulatoryReportingCode[]
    regulatory_reporting_code_required?: boolean
    reference_number_supported?: boolean
    reference_number_schemas?: ReferenceNumberScheme[]
    requested_execution_date_supported?: boolean
    requested_execution_date_max_period?: number
    remittance_reference_supported?: boolean
    final_successful_statuses?: PaymentStatus[]
    psu_type: PSUType
}

export interface SandboxUser {
    username?: string
    password?: string
    otp?: string
}

export interface SandboxInfo {
    users?: SandboxUser[]
}

export interface ASPSPData extends ASPSP {
    logo: string
    psu_types: PSUType[]
    auth_methods: AuthMethod[]
    maximum_consent_validity: number
    sandbox?: SandboxInfo
    beta: boolean
    bic?: string
    required_psu_headers?: string[]
    payments?: ResponsePaymentType[]
    group?: ASPSPGroup
}

/* =====================================================
   MISC RESPONSES
===================================================== */

export interface GetAspspsResponse {
    aspsps: ASPSPData[]
}

export interface GetApplicationResponse {
    name: string
    description?: string
    kid: string
    environment: Environment
    redirect_urls: string[]
    active: boolean
    countries: string[]
    services: Service[]
}

export interface ErrorResponse {
    message: string
    code?: number
    error?: string
    detail?: unknown
}

export interface SuccessResponse {
    message?: string
}
