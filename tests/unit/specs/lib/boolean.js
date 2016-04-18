'use strict';

const Bool = require('../../../../lib/boolean');
const should = require('should');

describe('boolean', function () {
  describe('isOn', function () {
    it('returns true if the val is yes', function () {
      should(Bool.isOn('yes')).be.true;
    });

    it('returns false if the val is no', function () {
      should(Bool.isOn('no')).be.false;
    });
  })

  describe('isOff', function () {
    it('returns false if the val is yes', function () {
      should(Bool.isOff('yes')).be.false;
    });

    it('returns false if the val is on', function () {
      should(Bool.isOff('on')).be.false;
    });

    it('returns true if the val is no', function () {
      should(Bool.isOff('no')).be.true;
    });

    it('returns true if the val is off', function () {
      should(Bool.isOff('off')).be.true;
    });
  })

  describe('areOn', function () {
    it('returns true if the env var is yes', function () {
      should(Bool.areOn([
        undefined, 'yes'
      ])).be.true;
    });

    it('returns false if the env var is no', function () {
      should(Bool.areOn([
        undefined, 'no'
      ])).be.false;
    });

    it('returns true if the override var is yes', function () {
      should(Bool.areOn([
        'yes'
      ])).be.true;
    });

    it('returns false if the override var is no', function () {
      should(Bool.areOn([
        'no'
      ])).be.false;
    });
  })
})
