const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const url = "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(url);

async function main() {
  const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  await helpers.impersonateAccount(TOKEN_HOLDER);
  const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

  const amountUSDCDesired = ethers.parseUnits("10", 6);
  const amountUSDCMin = ethers.parseUnits("5", 6);
  const amountUNIDesired = ethers.parseUnits("1", 18);
  const amountUNIInMin = ethers.parseUnits("0.5", 18);

  const USDC_Contract = await ethers.getContractAt(
    "IERC20",
    USDC,
    impersonatedSigner
  );
  const UNI_Contract = await ethers.getContractAt(
    "IERC20",
    UNI,
    impersonatedSigner
  );
  const ROUTER = await ethers.getContractAt(
    "IUniswapV2Router02",
    ROUTER_ADDRESS,
    impersonatedSigner
  );

  await USDC_Contract.approve(ROUTER, amountUSDCDesired);
  await UNI_Contract.approve(ROUTER, amountUNIDesired);

  let usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);
  let UNIBal = await UNI_Contract.balanceOf(impersonatedSigner.address);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10 + 1000000000;

  //   console.log(
  //     "====================Adding Liquidity with Token ====================================="
  //   );
  //   console.log("USDC balance before adding Liquidity", Number(usdcBal));
  //   console.log("UNI balance before adding Liquidity", Number(UNIBal));

  //   if (usdcBal < amountUSDCMin || UNIBal < amountUNIInMin) {
  //     console.error("Insufficient amount of tokens for adding liquidity");
  //     return;
  //   }

  //   const add = await ROUTER.addLiquidity(
  //     USDC,
  //     UNI,
  //     amountUSDCDesired,
  //     amountUNIDesired,
  //     0,
  //     0,
  //     impersonatedSigner,
  //     deadline
  //   );
  //   await add.wait();
  //   console.log(add);

  //   const usdcBalAfter = await USDC_Contract.balanceOf(
  //     impersonatedSigner.address
  //   );
  //   const UNIBalAfter = await UNI_Contract.balanceOf(impersonatedSigner.address);

  //   console.log("=========================================================");
  //   console.log("USDC balance after adding liquidity", Number(usdcBalAfter));
  //   console.log("UNI balance after adding liquidity", Number(UNIBalAfter));

  console.log(
    "====================Adding liquidity ETH====================================="
  );
  console.log(
    `ETH before: ${ethers.formatEther(
      await provider.getBalance(impersonatedSigner.address)
    )} ETH`
  );

  const usdcBalbeforeETHLiquidity = await USDC_Contract.balanceOf(
    impersonatedSigner.address
  );
  console.log(
    "USDC balance before adding ETH liquidity",
    Number(usdcBalbeforeETHLiquidity)
  );

  const amountUSDCDe = ethers.parseUnits("3000", 6);
  await USDC_Contract.approve(ROUTER, amountUSDCDe);
  const ethAmount = ethers.parseEther("1");

  let tx = await ROUTER.addLiquidityETH(
    USDC,
    amountUSDCDe,
    0,
    0,
    impersonatedSigner.address,
    deadline,
    { value: ethAmount }
  );
  await tx.wait();

  console.log(
    `ETH after: ${ethers.formatEther(
      await provider.getBalance(impersonatedSigner.address)
    )} ETH`
  );

  const usdcBalAfterETHLiquidity = await USDC_Contract.balanceOf(
    impersonatedSigner.address
  );
  console.log(
    "USDC balance after adding ETH liquidity",
    Number(usdcBalAfterETHLiquidity)
  );
  // const liq = ethers.parseUnits("300", 18);
  // tx = await ROUTER.removeLiquidity(
  //   USDC,
  //   UNI,
  //   liq,
  //   0,
  //   0,
  //   impersonatedSigner.address,
  //   deadline
  // );
  // await tx.wait();

  // usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);
  // UNIBal = await UNI_Contract.balanceOf(impersonatedSigner.address);

  // console.log("USDC balance after removing liquidity:", usdcBal);
  // console.log("UNI balance after removing liquidity:", UNIBal);

  console.log(
    "====================Swapping ETH for Exact Tokens====================================="
  );

  const usdcAmountOut = ethers.parseUnits("100", 6);

  const maxEth = ethers.parseEther("1");

  const path = [WETH, USDC];

  console.log(
    `ETH balance before swap: ${ethers.formatEther(
      await provider.getBalance(impersonatedSigner.address)
    )} ETH`
  );

  const usdcContract = await ethers.getContractAt(
    "IERC20",
    USDC,
    impersonatedSigner
  );
  const usdcBalanceBefore = await usdcContract.balanceOf(
    impersonatedSigner.address
  );
  console.log(
    `USDC balance before swap: ${ethers.formatUnits(usdcBalanceBefore, 6)} USDC`
  );

  let txw = await ROUTER.swapETHForExactTokens(
    usdcAmountOut,
    path,
    impersonatedSigner.address,
    deadline,
    { value: maxEth }
  );

  await txw.wait();

  console.log(
    `ETH balance after swap: ${ethers.formatEther(
      await provider.getBalance(impersonatedSigner.address)
    )} ETH`
  );

  const usdcBalanceAfter = await usdcContract.balanceOf(
    impersonatedSigner.address
  );
  console.log(
    `USDC balance after swap: ${ethers.formatUnits(usdcBalanceAfter, 6)} USDC`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
