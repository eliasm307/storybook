import { addons } from '@storybook/preview-api';
import { action, configureActions } from '../..';

jest.mock('@storybook/preview-api');

const createChannel = () => {
  const channel = { emit: jest.fn() };
  addons.getChannel.mockReturnValue(channel);
  return channel;
};
const getChannelData = (channel) => channel.emit.mock.calls[0][1].data.args;
const getChannelOptions = (channel) => channel.emit.mock.calls[0][1].options;

describe('Action', () => {
  it('with one argument', () => {
    const channel = createChannel();

    action('test-action')('one');

    expect(getChannelData(channel)).toEqual('one');
    expect(getChannelOptions(channel)).toEqual({ depth: 1 });
  });

  it('with multiple arguments', () => {
    const channel = createChannel();

    action('test-action')('one', 'two', 'three');

    expect(getChannelData(channel)).toEqual(['one', 'two', 'three']);
    expect(getChannelOptions(channel)).toEqual({ depth: 1 });
  });
});

describe('Depth config', () => {
  it('with global depth configuration', () => {
    const channel = createChannel();

    const depth = 1;

    configureActions({
      depth,
    });

    action('test-action')({
      root: {
        one: {
          two: 'foo',
        },
      },
    });

    expect(getChannelData(channel)).toEqual({
      root: {
        one: {
          two: 'foo',
        },
      },
    });
    expect(getChannelOptions(channel)).toEqual({ depth });
  });

  it('per action depth option overrides global config', () => {
    const channel = createChannel();

    configureActions({
      depth: 1,
    });

    action('test-action', { depth: 3 })({
      root: {
        one: {
          two: {
            three: {
              four: {
                five: 'foo',
              },
            },
          },
        },
      },
    });

    expect(getChannelData(channel)).toEqual({
      root: {
        one: {
          two: {
            three: {
              four: {
                five: 'foo',
              },
            },
          },
        },
      },
    });
    expect(getChannelOptions(channel)).toEqual({ depth: 3 });
  });
});

describe('allowFunction config', () => {
  it('with global allowFunction false', () => {
    const channel = createChannel();

    const allowFunction = false;

    configureActions({
      allowFunction,
    });

    action('test-action')({
      root: {
        one: {
          a: 1,
          b: () => 'foo',
        },
      },
    });

    expect(getChannelData(channel)).toEqual({
      root: {
        one: {
          a: 1,
          b: expect.any(Function),
        },
      },
    });
    expect(getChannelOptions(channel)).toEqual({ depth: 1 });
  });

  // TODO: this test is pretty pointless, as the real channel isn't used, nothing is changed
  it('with global allowFunction true', () => {
    const channel = createChannel();

    const allowFunction = true;

    configureActions({
      allowFunction,
    });

    action('test-action')({
      root: {
        one: {
          a: 1,
          b: () => 'foo',
        },
      },
    });

    expect(getChannelData(channel)).toEqual({
      root: {
        one: {
          a: 1,
          b: expect.any(Function),
        },
      },
    });
    expect(getChannelOptions(channel)).toEqual({ depth: 1 });
  });
});
