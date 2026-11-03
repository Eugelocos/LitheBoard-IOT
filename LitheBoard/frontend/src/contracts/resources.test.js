import { buildEntity, buildWidget, buildAlarm, buildDashboard, buildNotification, buildHistoric, buildUser, buildRulechain } from '../test/test_utils';

it('uses canonical resource fields in frontend factories', () => {
  expect(buildEntity()).toHaveProperty('name');
  expect(buildWidget()).toHaveProperty('widget_config');
  expect(buildAlarm()).toMatchObject({ threshold: 30, data_key: 'temp', operator: 'greater_than' });
  expect(buildDashboard()).toHaveProperty('shared_client_ids', []);
  expect(buildNotification()).toMatchObject({ is_read: false, value: 35 });
  expect(buildHistoric()).toMatchObject({ data_key: 'temp', data: { temp: 21.5 } });
  expect(buildUser()).toHaveProperty('client_id');
  expect(buildUser()).not.toHaveProperty('id');
  expect(buildRulechain()).toHaveProperty('definition');
});
