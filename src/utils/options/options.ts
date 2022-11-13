import type {
	InputOptions,
	InputPluginOption,
	NormalizedGeneratedCodeOptions,
	NormalizedOutputOptions,
	NormalizedTreeshakingOptions,
	OutputOptions,
	OutputPlugin,
	OutputPluginOption,
	Plugin,
	WarningHandler
} from '../../rollup/types';
import { asyncFlatten } from '../asyncFlatten';
import { EMPTY_ARRAY } from '../blank';
import { error, errorInvalidOption, errorUnknownOption } from '../error';
import { printQuotedStringList } from '../printStringList';

export interface GenericConfigObject {
	[key: string]: unknown;
}

export const defaultOnWarn: WarningHandler = warning => console.warn(warning.message || warning);

export function warnUnknownOptions(
	passedOptions: object,
	validOptions: readonly string[],
	optionType: string,
	warn: WarningHandler,
	ignoredKeys = /$./
): void {
	const validOptionSet = new Set(validOptions);
	const unknownOptions = Object.keys(passedOptions).filter(
		key => !(validOptionSet.has(key) || ignoredKeys.test(key))
	);
	if (unknownOptions.length > 0) {
		warn(errorUnknownOption(optionType, unknownOptions, [...validOptionSet].sort()));
	}
}

type ObjectValue<Base> = Base extends Record<string, any> ? Base : never;

export const treeshakePresets: {
	[key in NonNullable<
		ObjectValue<InputOptions['treeshake']>['preset']
	>]: NormalizedTreeshakingOptions;
} = {
	recommended: {
		annotations: true,
		correctVarValueBeforeDeclaration: false,
		experimentalManualPureFunctions: EMPTY_ARRAY,
		moduleSideEffects: () => true,
		propertyReadSideEffects: true,
		tryCatchDeoptimization: true,
		unknownGlobalSideEffects: false
	},
	safest: {
		annotations: true,
		correctVarValueBeforeDeclaration: true,
		experimentalManualPureFunctions: EMPTY_ARRAY,
		moduleSideEffects: () => true,
		propertyReadSideEffects: true,
		tryCatchDeoptimization: true,
		unknownGlobalSideEffects: true
	},
	smallest: {
		annotations: true,
		correctVarValueBeforeDeclaration: false,
		experimentalManualPureFunctions: EMPTY_ARRAY,
		moduleSideEffects: () => false,
		propertyReadSideEffects: false,
		tryCatchDeoptimization: false,
		unknownGlobalSideEffects: false
	}
};

export const generatedCodePresets: {
	[key in NonNullable<
		ObjectValue<OutputOptions['generatedCode']>['preset']
	>]: NormalizedOutputOptions['generatedCode'];
} = {
	es2015: {
		arrowFunctions: true,
		constBindings: true,
		objectShorthand: true,
		reservedNamesAsProps: true,
		symbols: true
	},
	es5: {
		arrowFunctions: false,
		constBindings: false,
		objectShorthand: false,
		reservedNamesAsProps: true,
		symbols: false
	}
};

type ObjectOptionWithPresets =
	| Partial<NormalizedTreeshakingOptions>
	| Partial<NormalizedGeneratedCodeOptions>;

export const objectifyOption = (value: unknown): Record<string, unknown> =>
	value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const objectifyOptionWithPresets =
	<T extends ObjectOptionWithPresets>(
		presets: Record<string, T>,
		optionName: string,
		additionalValues: string
	) =>
	(value: unknown): Record<string, unknown> => {
		if (typeof value === 'string') {
			const preset = presets[value];
			if (preset) {
				return preset;
			}
			error(
				errorInvalidOption(
					optionName,
					getHashFromObjectOption(optionName),
					`valid values are ${additionalValues}${printQuotedStringList(
						Object.keys(presets)
					)}. You can also supply an object for more fine-grained control`,
					value
				)
			);
		}
		return objectifyOption(value);
	};

export const getOptionWithPreset = <T extends ObjectOptionWithPresets>(
	value: unknown,
	presets: Record<string, T>,
	optionName: string,
	additionalValues: string
): Record<string, unknown> => {
	const presetName: string | undefined = (value as any)?.preset;
	if (presetName) {
		const preset = presets[presetName];
		if (preset) {
			return { ...preset, ...(value as Record<string, unknown>) };
		} else {
			error(
				errorInvalidOption(
					`${optionName}.preset`,
					getHashFromObjectOption(optionName),
					`valid values are ${printQuotedStringList(Object.keys(presets))}`,
					presetName
				)
			);
		}
	}
	return objectifyOptionWithPresets(presets, optionName, additionalValues)(value);
};

const getHashFromObjectOption = (optionName: string): string =>
	optionName.split('.').join('').toLowerCase();

export const normalizePluginOption: {
	(plugins: InputPluginOption): Promise<Plugin[]>;
	(plugins: OutputPluginOption): Promise<OutputPlugin[]>;
	(plugins: unknown): Promise<any[]>;
} = async (plugins: any) => (await asyncFlatten([plugins])).filter(Boolean);
