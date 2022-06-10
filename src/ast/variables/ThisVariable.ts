import type { AstContext } from '../../Module';
import type { HasEffectsContext } from '../ExecutionContext';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import ParameterVariable from './ParameterVariable';

export default class ThisVariable extends ParameterVariable {
	constructor(context: AstContext) {
		super('this', null, null, context);
	}

	protected getInit(context: HasEffectsContext): ExpressionEntity {
		return context.replacedVariableInits.get(this) || UNKNOWN_EXPRESSION;
	}
}
