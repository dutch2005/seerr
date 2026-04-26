import { getRepository } from '@server/datasource';
import { Watchlist } from '@server/entity/Watchlist';

export const WatchlistRepository = getRepository(Watchlist).extend({});
