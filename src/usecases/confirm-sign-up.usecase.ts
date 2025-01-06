import { CredentialsType } from "@/types/user.type";
import { verifyUsecase } from ".";

interface ConfirmSignUpUsecaseRequest {
  token: string;
  type: CredentialsType;
  identifier: string;
}

export class ConfirmSignUpUsecase {
  async execute(request: ConfirmSignUpUsecaseRequest) {
    return verifyUsecase.execute({
      token: request.token,
      type: request.type,
      identifier: request.identifier,
    });
  }
}
