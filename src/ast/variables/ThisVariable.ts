import type { AstContext } from '../../Module';
import type { HasEffectsContext } from '../ExecutionContext';
import { NodeInteraction } from '../NodeInteractions';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import { ObjectPath } from '../utils/PathTracker';
import ParameterVariable from './ParameterVariable';

export default class ThisVariable extends ParameterVariable {
	constructor(context: AstContext) {
		super('this', null, null, context);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return (
			this.getInit(context).hasEffectsOnInteractionAtPath(path, interaction, context) ||
			super.hasEffectsOnInteractionAtPath(path, interaction, context)
		);
	}

	private getInit(context: HasEffectsContext): ExpressionEntity {
		return context.replacedVariableInits.get(this) || UNKNOWN_EXPRESSION;
	}
}
