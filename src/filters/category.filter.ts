import {Category} from '../models';
import {DefaultFilter} from './default-filters';

export class CategoryFilterBuilder extends DefaultFilter<Category> {
  protected defaultFilter() {
    return this.isActive(Category);
  }
}
