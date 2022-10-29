import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { PostgresErrorCodes } from '@common/interfaces/postgresErrorCodes';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from '../dto/featureFlag.dto';
import { FeatureFlag } from '../entities/featureFlag.entity';


@Injectable()
export class FeatureFlagService {

    constructor(
        @InjectRepository(FeatureFlag) private readonly featureFlagRepository: Repository<FeatureFlag>
    ) { }

    async findAllFeatureFlags(query: PaginateQuery): Promise<Paginated<FeatureFlag>> {
        try {

            return await paginate(query, this.featureFlagRepository, {
                sortableColumns: ['createdAt'],
                defaultSortBy: [['createdAt', 'DESC']],
            });

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findFeatureFlagByID(id: string): Promise<FeatureFlag> {
        try {

            const featureFlag = await this.featureFlagRepository.findOneBy({ id });

            if (featureFlag) return featureFlag;

            throw new NotFoundException(`Feature Flag with ID: ${id} not found`);

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findFeatureFlagByName(name: string): Promise<FeatureFlag> {
        try {

            const featureFlag = await this.featureFlagRepository.findOneBy({ name });

            if (featureFlag) return featureFlag;

            throw new NotFoundException(`Feature Flag with Name: ${name} not found`);

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createFeatureFlag(createFeatureFlagDto: CreateFeatureFlagDto) {
        try {

            const newFlag = this.featureFlagRepository.create(createFeatureFlagDto);

            await this.featureFlagRepository.save(newFlag);

            return newFlag;

        } catch (error) {
            console.error(error.message)
            if (error?.code === PostgresErrorCodes.UniqueViolation) {
                throw new ConflictException(
                    `User with ${createFeatureFlagDto.name} already exists`
                );
            }
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    };

    async updateFeatureFlag(id: string, updateFeatureFlagDto: UpdateFeatureFlagDto) {
        try {

            const updatedFlag = await this.featureFlagRepository.update(id, updateFeatureFlagDto);

            if (!updatedFlag.affected) {
                throw new NotFoundException(`Flag With ID: ${id} not found`);
            }

        } catch (error) {
            
            if (error?.code === PostgresErrorCodes.UniqueViolation) {
                throw new ConflictException(
                    'Feature flag with that name already exists'
                );
            }
            
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async deleteFeatureFlag(id: string) {
        try {

            const deleteFlag = await this.featureFlagRepository.delete(id);

            if (!deleteFlag.affected) {
                throw new NotFoundException(`Flag With ID: ${id} not found`);
            }

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async isEnabled(name: string) {
        try {

            const featureFlag = await this.findFeatureFlagByName(name);

            if (featureFlag) {
                return featureFlag.isEnabled
            }

            return false;

        } catch (error) {
            console.error(error);
            throw new HttpException(
                error.message ?? 'SOMETHING WENT WRONG',
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
