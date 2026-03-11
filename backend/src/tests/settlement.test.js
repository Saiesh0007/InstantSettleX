// tests/settlement.test.js

const SettlementEngine = require('../src/services/settlement.engine');
const SettlementModel = require('../src/models/settlement.model');
const TradeModel = require('../src/models/trade.model');
const BlockchainService = require('../src/services/blockchain.service');
const redis = require('../src/config/redis');

jest.mock('../src/models/settlement.model');
jest.mock('../src/models/trade.model');
jest.mock('../src/services/blockchain.service');
jest.mock('../src/services/risk.service', () => ({
  assessTrade: jest.fn().mockResolvedValue({ blocked: false, score: 10, level: 'low' }),
}));
jest.mock('../src/config/redis', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  client: {
    set: jest.fn().mockResolvedValue('OK'),
  },
}));

describe('Settlement Engine', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('queueSettlement', () => {
    it('should queue a settlement for a valid trade', async () => {
      const mockTrade = {
        id: 'trade-1', user_id: 'user-1', asset: 'ETH',
        quantity: 1, price: 3000, from_address: '0xfrom', to_address: '0xto',
      };

      SettlementModel.create.mockResolvedValue({ id: 'settlement-1', trade_id: 'trade-1' });
      TradeModel.updateStatus.mockResolvedValue({});

      const result = await SettlementEngine.queueSettlement(mockTrade);

      expect(result.queued).toBe(true);
      expect(result.settlementId).toBe('settlement-1');
      expect(SettlementModel.create).toHaveBeenCalledTimes(1);
      expect(TradeModel.updateStatus).toHaveBeenCalledWith('trade-1', 'settling');
    });
  });

  describe('processSettlement', () => {
    it('should confirm a settlement successfully', async () => {
      redis.client.set.mockResolvedValue('OK');

      SettlementModel.findById.mockResolvedValue({
        id: 'settlement-1', trade_id: 'trade-1',
        from_address: '0xfrom', to_address: '0xto', amount: 1.5, asset: 'ETH',
        retry_count: 0,
      });

      BlockchainService.submitSettlement.mockResolvedValue({ txHash: '0xtxhash', gasEstimate: '120000' });
      BlockchainService.waitForConfirmation.mockResolvedValue({ blockNumber: 19000000, gasUsed: '100000' });
      SettlementModel.updateOnSubmit.mockResolvedValue({});
      SettlementModel.updateOnConfirm.mockResolvedValue({});
      TradeModel.updateStatus.mockResolvedValue({});

      const result = await SettlementEngine.processSettlement('settlement-1');

      expect(result.success).toBe(true);
      expect(result.txHash).toBe('0xtxhash');
    });

    it('should handle blockchain failure and increment retry count', async () => {
      redis.client.set.mockResolvedValue('OK');

      SettlementModel.findById.mockResolvedValue({
        id: 'settlement-1', trade_id: 'trade-1', retry_count: 0,
      });

      BlockchainService.submitSettlement.mockRejectedValue(new Error('Network error'));
      SettlementModel.updateOnFailure.mockResolvedValue({});

      const result = await SettlementEngine.processSettlement('settlement-1');

      expect(result.success).toBe(false);
      expect(SettlementModel.updateOnFailure).toHaveBeenCalledWith('settlement-1', {
        reason: 'Network error',
        retryCount: 1,
      });
    });
  });
});