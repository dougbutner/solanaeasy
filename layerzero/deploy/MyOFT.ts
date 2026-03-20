import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

/** One OFT deployment per token; LayerZero wiring is 1:1 with Solana OFT-{TOKEN}.json stores. */
const TOKENS = [
    { deployment: 'MyOFT_QUICK', name: 'QUICK', symbol: 'QUICK', saltEnv: 'QUICK_OFT_CREATE2_SALT' },
    { deployment: 'MyOFT_SOLID', name: 'SOLID', symbol: 'SOLID', saltEnv: 'SOLID_OFT_CREATE2_SALT' },
    { deployment: 'MyOFT_SOLOMON', name: 'SOLOMON', symbol: 'SOLOMON', saltEnv: 'SOLOMON_OFT_CREATE2_SALT' },
    { deployment: 'MyOFT_GAINE', name: 'GAINE', symbol: 'GAINE', saltEnv: 'GAINE_OFT_CREATE2_SALT' },
] as const

/** 32-byte CREATE2 salt for hardhat-deploy (0x + 64 hex). */
const CREATE2_SALT_RE = /^0x[0-9a-fA-F]{64}$/

const deployFn: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    for (const t of TOKENS) {
        const rawSalt = process.env[t.saltEnv]?.trim()
        const deterministicDeployment =
            rawSalt && CREATE2_SALT_RE.test(rawSalt) ? rawSalt : false

        if (deterministicDeployment) {
            console.log(`${t.deployment}: CREATE2 (salt from ${t.saltEnv})`)
        } else {
            console.log(
                `${t.deployment}: standard CREATE (optional vanity: set ${t.saltEnv}=0x<64 hex chars> for CREATE2)`
            )
        }

        const { address } = await deploy(t.deployment, {
            contract: 'MyOFT',
            from: deployer,
            args: [t.name, t.symbol, endpointV2Deployment.address, deployer],
            log: true,
            skipIfAlreadyDeployed: true,
            ...(deterministicDeployment ? { deterministicDeployment } : {}),
        })

        console.log(`Deployed ${t.deployment} at ${address}`)
    }
}

deployFn.tags = ['MyOFT']

export default deployFn
