import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { categorize } from '../src/categorize';

test('composite values 1', () => {
    const result = categorize('box-shadow', 'red', { scales: { color: ['red'], space: ['sm', 'md', 'lg'] } });
    assert.is(result, 'color');
})
test('composite values 2', () => {
    const result = categorize('width', 'full', { scales: { width: ['full', 'screen'], size: ['sm', 'md', 'lg'] } });
    assert.is(result, 'width');
})
test('css vars', () => {
    const result = categorize('--m', 'lg', { scales: { space: ['sm', 'md', 'lg'] } })
    assert.is(result, 'space');
})

test.run();
