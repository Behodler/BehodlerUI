import ProductionMappings from '../temp/ProductionMappings.json';
import DevMappings from '../temp/BehodlerABIAddressMappingDev.json';
import RopstenMappings from '../temp/BehodlerABIAddressMappingRopsten.json';

export const getBehodlerABIAddressMapping = (networkName: string) => ({
    main: ProductionMappings,
    development: DevMappings,
    ropsten: RopstenMappings,
}[networkName] || ProductionMappings);
